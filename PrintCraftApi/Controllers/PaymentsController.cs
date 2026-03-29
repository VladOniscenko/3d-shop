using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Mollie.Api.Client;
using Mollie.Api.Models;
using Mollie.Api.Models.Payment;
using Mollie.Api.Models.Payment.Request;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using PrintCraftApi.Services;
using PrintCraftApi.Validation;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IConfiguration _configuration;
    private readonly PaymentClient _paymentClient;
    private readonly IEmailService _emailService;
    private readonly IDiscordWebhookService _discordWebhookService;
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(
        PrintCraftDb db,
        IConfiguration configuration,
        IEmailService emailService,
        IDiscordWebhookService discordWebhookService,
        ILogger<PaymentsController> logger)
    {
        _db = db;
        _configuration = configuration;
        _emailService = emailService;
        _discordWebhookService = discordWebhookService;
        _logger = logger;
        var mollieKey = GetRequiredConfig("MollieKey");
        _paymentClient = new PaymentClient(mollieKey);
    }

    [HttpPost("orders/{orderId:guid}/create")]
    [Authorize]
    [EnableRateLimiting("CheckoutLimit")]
    public async Task<IActionResult> CreateQuotedOrderCheckout([FromRoute] Guid orderId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr))
            return Unauthorized(new { message = "User not authenticated" });

        var userId = Guid.Parse(userIdStr);
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        if (!string.Equals(order.Status, "quoted", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(order.Status, "pending_payment", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only quoted orders can be paid." });

        if (order.IsPaid)
            return BadRequest(new { message = "Order is already paid." });

        if (!order.QuotedPrice.HasValue || order.QuotedPrice.Value <= 0)
            return BadRequest(new { message = "Quoted price is missing for this order." });

        var shippingValidation = ShippingInfoValidator.Validate(
            order.FullName,
            order.PhoneNumber,
            order.AddressLine1,
            order.City,
            order.PostalCode);

        if (!shippingValidation.IsValid)
        {
            return BadRequest(new
            {
                message = "Shipping details are required before payment.",
                errors = shippingValidation.Errors
            });
        }

        var frontendBaseUrl = GetRequiredConfig("FrontendBaseUrl").TrimEnd('/');
        var backendBaseUrl = GetRequiredConfig("BackendBaseUrl").TrimEnd('/');

        var paymentRequest = new PaymentRequest
        {
            Amount = new Amount(Currency.EUR, order.QuotedPrice.Value.ToString("F2")),
            Description = $"Quoted order #{order.Id.ToString()[..8]}",
            RedirectUrl = $"{frontendBaseUrl}/orders/{order.Id}?payment=return",
            WebhookUrl = $"{backendBaseUrl}/api/payments/webhook",
            Metadata = order.Id.ToString()
        };

        var paymentResponse = await _paymentClient.CreatePaymentAsync(paymentRequest);
        var quotedCheckoutUrl = paymentResponse.Links?.Checkout?.Href;
        if (string.IsNullOrWhiteSpace(quotedCheckoutUrl))
        {
            return BadRequest(new { message = "Mollie did not return a checkout URL." });
        }

        var previousStatus = order.Status;
        order.Status = "pending_payment";
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "customer", "Payment checkout created");

        return Ok(new
        {
            checkoutUrl = quotedCheckoutUrl,
            orderId = order.Id
        });
    }

    [HttpPost("create")]
    [Authorize]
    [EnableRateLimiting("CheckoutLimit")]
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

        var shippingValidation = ShippingInfoValidator.Validate(
            req.FullName,
            req.PhoneNumber,
            req.AddressLine1,
            req.City,
            req.PostalCode);

        if (!shippingValidation.IsValid)
        {
            return BadRequest(new
            {
                message = "Please correct shipping info and try again.",
                errors = shippingValidation.Errors
            });
        }

        // Validate prices from database products
        decimal subtotal = 0m;
        decimal deliveryPrice = 6.95m;
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Count <= 0 || cartItem.Count > 100)
                return BadRequest(new { message = "Invalid cart item quantity." });

            // Get product to validate price
            var product = await _db.Products.FindAsync(cartItem.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Product {cartItem.ProductId} not found" });

            decimal productPrice = ProductPricing.EffectivePrice(product.Price, product.DiscountPercentage);
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
            FullName = shippingValidation.FullName,
            AddressLine1 = shippingValidation.AddressLine1,
            City = shippingValidation.City,
            PostalCode = shippingValidation.PostalCode,
            PhoneNumber = shippingValidation.PhoneNumber,
            DeliveryPrice = deliveryPrice,
            Status = "pending_payment",
            OrderType = "online",
            IsPaid = false,
            Items = orderItems
        };

        _db.Orders.Add(newOrder);
        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(newOrder.Id, null, newOrder.Status, "system", "Online checkout order created");

        try
        {
            var user = await _db.Users.FindAsync(userId);
            if (user != null)
            {
                await _discordWebhookService.SendBookingCreatedAsync(newOrder, user);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed sending booking Discord notification for order {OrderId}", newOrder.Id);
        }

        var paymentRequest = new PaymentRequest()
        {
            Amount = new Amount(Currency.EUR, finalTotal.ToString("F2")),
            Description = $"Order #{newOrder.Id.ToString().Substring(0, 8)}",
            RedirectUrl = $"{GetRequiredConfig("FrontendBaseUrl").TrimEnd('/')}/orders/{newOrder.Id}?payment=return",
            WebhookUrl = $"{GetRequiredConfig("BackendBaseUrl").TrimEnd('/')}/api/payments/webhook",
            Metadata = newOrder.Id.ToString()
        };

        var paymentResponse = await _paymentClient.CreatePaymentAsync(paymentRequest);
        var checkoutUrl = paymentResponse.Links?.Checkout?.Href;
        if (string.IsNullOrWhiteSpace(checkoutUrl))
        {
            return BadRequest(new { message = "Mollie did not return a checkout URL." });
        }

        // Clear the cart after successful payment link creation
        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            checkoutUrl,
            orderId = newOrder.Id
        });
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
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
                var order = await _db.Orders
                    .Include(o => o.Items)
                    .FirstOrDefaultAsync(o => o.Id == orderId);
                if (order != null)
                {
                    if (payment.Status == PaymentStatus.Paid)
                    {
                        var wasAlreadyPaid = order.IsPaid;
                        var previousStatus = order.Status;
                        order.Status = "paid";
                        order.IsPaid = true;
                        order.UpdatedAt = DateTime.UtcNow;

                        if (!wasAlreadyPaid)
                        {
                            var user = await _db.Users.FindAsync(order.UserId);
                            var paidAmount = order.QuotedPrice
                                ?? order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count)) + order.DeliveryPrice;

                            if (user != null)
                            {
                                await _emailService.SendOrderPaidEmailAsync(user.Email, user.Name, order.Id, paidAmount);
                            }

                            await _discordWebhookService.SendPaymentReceivedAsync(order, user, paidAmount);
                        }

                        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "mollie_webhook", "Payment marked as paid");
                    }
                    else if (payment.Status == PaymentStatus.Canceled || payment.Status == PaymentStatus.Expired)
                    {
                        var previousStatus = order.Status;
                        order.Status = string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase)
                            ? "quoted"
                            : "failed";
                        order.UpdatedAt = DateTime.UtcNow;
                        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "mollie_webhook", "Payment cancelled or expired");
                    }

                    await _db.SaveChangesAsync();
                }
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mollie webhook processing failed.");
            return Ok();
        }
    }

    private async Task LogStatusHistoryAsync(Guid orderId, string? previousStatus, string? newStatus, string changedBy, string? note)
    {
        if (string.IsNullOrWhiteSpace(newStatus)) return;
        if (string.Equals(previousStatus, newStatus, StringComparison.OrdinalIgnoreCase)) return;

        _db.OrderStatusHistory.Add(new OrderStatusHistory
        {
            OrderId = orderId,
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            ChangedAt = DateTime.UtcNow,
            ChangedBy = changedBy,
            Note = note,
        });

        await _db.SaveChangesAsync();
    }

    private string GetRequiredConfig(string key)
    {
        var value = _configuration[key];
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{key} must be configured via environment variables.");

        return value;
    }
}

public record CheckoutRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string City,
    string PostalCode
);
