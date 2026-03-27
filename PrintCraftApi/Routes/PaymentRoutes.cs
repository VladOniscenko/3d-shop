using Mollie.Api.Client;
using Mollie.Api.Models;
using Mollie.Api.Models.Payment;
using Mollie.Api.Models.Payment.Request;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using System.Security.Claims;

namespace PrintCraftApi.Routes;

public static class PaymentRoutes
{
    public static void MapPaymentRoutes(this IEndpointRouteBuilder app, string mollieKey)
    {
        var group = app.MapGroup("/api/payments");
        var paymentClient = new PaymentClient(mollieKey);

        // 1. CREATE CHECKOUT
        group.MapPost("/create", async (CheckoutRequest req, ClaimsPrincipal user, PrintCraftDb db) =>
        {
            var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid? userId = userIdStr != null ? Guid.Parse(userIdStr) : null;

            var productIds = req.Items.Select(i => i.ProductId).ToList();
            var dbProducts = await db.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            decimal subtotal = 0m;
            decimal deliveryPrice = 6.95m;
            var orderItems = new List<OrderItem>();

            foreach (var cartItem in req.Items)
            {
                var product = dbProducts.FirstOrDefault(p => p.Id == cartItem.ProductId);
                if (product == null) continue;

                // Fixes CS0019: Explicitly cast Price to decimal for math
                decimal productPrice = (decimal)product.Price;
                subtotal += productPrice * cartItem.Count;

                orderItems.Add(new OrderItem
                {
                    fileName = product.Name ?? "Unknown Item",
                    FileUrl = product.ImageUrl ?? string.Empty, // Fixes null warnings
                    Material = cartItem.Material ?? "PLA",
                    Color = cartItem.Color ?? "Black",
                    Count = cartItem.Count,
                    Price = (double)productPrice
                });
            }

            if (orderItems.Count == 0) return Results.BadRequest("Cart is empty or invalid.");

            decimal finalTotal = subtotal + deliveryPrice;

            var newOrder = new Order
            {
                UserId = userId,
                FullName = req.FullName,
                AddressLine1 = req.AddressLine1,
                City = req.City,
                PostalCode = req.PostalCode,
                PhoneNumber = req.PhoneNumber,
                DeliveryPrice = deliveryPrice,
                Status = "pending_payment",
                Items = orderItems
            };

            db.Orders.Add(newOrder);
            await db.SaveChangesAsync();

            var paymentRequest = new PaymentRequest()
            {
                Amount = new Amount(Currency.EUR, finalTotal.ToString("F2")),
                Description = $"Order #{newOrder.Id.ToString().Substring(0, 8)}",
                RedirectUrl = $"http://localhost:5173/order-status?orderId={newOrder.Id}",
                WebhookUrl = "https://your-api-domain.com/api/payments/webhook",
                Metadata = newOrder.Id.ToString()
            };

            var paymentResponse = await paymentClient.CreatePaymentAsync(paymentRequest);

            return Results.Ok(new
            {
                checkoutUrl = paymentResponse.Links.Checkout.Href,
                orderId = newOrder.Id
            });
        });

        // 2. WEBHOOK
        group.MapPost("/webhook", async (HttpContext context, PrintCraftDb db) =>
        {
            try
            {
                var form = await context.Request.ReadFormAsync();
                string? paymentId = form["id"];

                if (string.IsNullOrEmpty(paymentId)) return Results.Ok();

                var payment = await paymentClient.GetPaymentAsync(paymentId);

                // Safe parsing of metadata to avoid null dereference warnings
                string? metadata = payment.Metadata?.ToString();
                if (Guid.TryParse(metadata, out Guid orderId))
                {
                    var order = await db.Orders.FindAsync(orderId);
                    if (order != null)
                    {
                        if (payment.Status == PaymentStatus.Paid)
                        {
                            order.Status = "paid";
                        }
                        else if (payment.Status == PaymentStatus.Canceled || payment.Status == PaymentStatus.Expired)
                        {
                            order.Status = "failed";
                        }

                        await db.SaveChangesAsync();
                    }
                }

                return Results.Ok();
            }
            catch
            {
                return Results.Ok();
            }
        });
    }
}

public record CheckoutRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string City,
    string PostalCode,
    List<CartItemDto> Items
);

public record CartItemDto(
    Guid ProductId,
    int Count,
    string Material,
    string Color
);