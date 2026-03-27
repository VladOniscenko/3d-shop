using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mollie.Api.Client;
using Mollie.Api.Models;
using Mollie.Api.Models.Payment;
using Mollie.Api.Models.Payment.Request;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IConfiguration _configuration;
    private readonly PaymentClient _paymentClient;

    public PaymentsController(PrintCraftDb db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
        var mollieKey = configuration["MollieKey"] ?? "";
        _paymentClient = new PaymentClient(mollieKey);
    }

    [HttpPost("create")]
    [Authorize]
    public async Task<IActionResult> CreateCheckout([FromBody] CheckoutRequest req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized(new { message = "User not authenticated" });

        var userId = Guid.Parse(userIdStr);

        // Get user's cart from database
        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || cart.Items.Count == 0)
            return BadRequest(new { message = "Cart is empty" });

        // Validate prices from database products
        decimal subtotal = 0m;
        decimal deliveryPrice = 6.95m;
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cart.Items)
        {
            // Get product to validate price
            var product = await _db.Products.FindAsync(cartItem.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Product {cartItem.ProductId} not found" });

            decimal productPrice = (decimal)product.Price;
            subtotal += productPrice * cartItem.Count;

            orderItems.Add(new OrderItem
            {
                fileName = product.Name ?? "Unknown Item",
                FileUrl = product.ImageUrl ?? string.Empty,
                Material = cartItem.Material,
                Color = cartItem.Color,
                Count = cartItem.Count,
                Price = (double)productPrice
            });
        }

        decimal finalTotal = subtotal + deliveryPrice;

        // Create Order from cart
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

        _db.Orders.Add(newOrder);
        await _db.SaveChangesAsync();

        var paymentRequest = new PaymentRequest()
        {
            Amount = new Amount(Currency.EUR, finalTotal.ToString("F2")),
            Description = $"Order #{newOrder.Id.ToString().Substring(0, 8)}",
            RedirectUrl = $"http://localhost:5173/order-status?orderId={newOrder.Id}",
            WebhookUrl = "https://your-api-domain.com/api/payments/webhook",
            Metadata = newOrder.Id.ToString()
        };

        var paymentResponse = await _paymentClient.CreatePaymentAsync(paymentRequest);

        // Clear the cart after successful payment link creation
        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            checkoutUrl = paymentResponse.Links.Checkout.Href,
            orderId = newOrder.Id
        });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook()
    {
        try
        {
            var form = await Request.ReadFormAsync();
            string? paymentId = form["id"];

            if (string.IsNullOrEmpty(paymentId))
                return Ok();

            var payment = await _paymentClient.GetPaymentAsync(paymentId);

            string? metadata = payment.Metadata?.ToString();
            if (Guid.TryParse(metadata, out Guid orderId))
            {
                var order = await _db.Orders.FindAsync(orderId);
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

                    await _db.SaveChangesAsync();
                }
            }

            return Ok();
        }
        catch
        {
            return Ok();
        }
    }
}

public record CheckoutRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string City,
    string PostalCode
);
