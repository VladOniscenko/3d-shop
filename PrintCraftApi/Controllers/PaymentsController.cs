using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Configuration;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using PrintCraftApi.Services;
using PrintCraftApi.Validation;
using Stripe;
using Stripe.Checkout;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IConfiguration _configuration;
    private readonly SessionService _checkoutSessionService;
    private readonly IEmailService _emailService;
    private readonly IDiscordWebhookService _discordWebhookService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly string _currencyCode;
    private readonly IReadOnlyList<string> _stripeWebhookSecrets;

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

        _currencyCode = NormalizeCurrencyCode(_configuration["CurrencyCode"]);
        StripeConfiguration.ApiKey = GetRequiredConfig("StripeSecretKey");
        _stripeWebhookSecrets = LoadStripeWebhookSecrets(_configuration);
        _checkoutSessionService = new SessionService();
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

        var statusBeforeLifecycle = order.Status;
        var lifecycle = QuoteLifecycle.ApplyQuoteExpiration(order, DateTime.UtcNow);
        if (lifecycle.HasChanges)
        {
            await _db.SaveChangesAsync();

            if (lifecycle.StatusChanged)
            {
                await LogStatusHistoryAsync(
                    order.Id,
                    statusBeforeLifecycle,
                    order.Status,
                    "system",
                    "Quote expired after 7 days without payment");
            }
        }

        if (string.Equals(order.Status, "expired_quote", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Quote has expired. Request a new quote to continue." });

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
        var user = await _db.Users.FindAsync(userId);

        var paymentRecord = await CreateAndStoreStripeCheckoutAsync(
            order,
            order.QuotedPrice.Value,
            $"Quoted order #{order.Id.ToString()[..8]}",
            $"{frontendBaseUrl}/orders/{order.Id}",
            user?.Email);

        var quotedCheckoutUrl = paymentRecord.CheckoutUrl;
        if (string.IsNullOrWhiteSpace(quotedCheckoutUrl))
            return BadRequest(new { message = "Stripe did not return a checkout URL." });

        var previousStatus = order.Status;
        order.Status = "pending_payment";
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "customer", "Payment checkout created");

        return Ok(new
        {
            checkoutUrl = quotedCheckoutUrl,
            orderId = order.Id,
            paymentReference = paymentRecord.Reference
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

        decimal subtotal = 0m;
        const decimal deliveryPrice = 6.95m;
        var orderItems = new List<OrderItem>();

        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Count <= 0 || cartItem.Count > AppLimits.MaxItemQuantity)
                return BadRequest(new { message = "Invalid cart item quantity." });

            var product = await _db.Products.FindAsync(cartItem.ProductId);
            if (product == null)
                return BadRequest(new { message = $"Product {cartItem.ProductId} not found" });

            var productPrice = ProductPricing.EffectivePrice(product.Price, product.DiscountPercentage);
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

        var finalTotal = subtotal + deliveryPrice;

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

        var user = await _db.Users.FindAsync(userId);

        try
        {
            if (user != null)
            {
                await _discordWebhookService.SendBookingCreatedAsync(newOrder, user);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed sending booking Discord notification for order {OrderId}", newOrder.Id);
        }

        var paymentRecord = await CreateAndStoreStripeCheckoutAsync(
            newOrder,
            finalTotal,
            $"Order #{newOrder.Id.ToString()[..8]}",
            $"{GetRequiredConfig("FrontendBaseUrl").TrimEnd('/')}/orders/{newOrder.Id}",
            user?.Email);

        var checkoutUrl = paymentRecord.CheckoutUrl;
        if (string.IsNullOrWhiteSpace(checkoutUrl))
            return BadRequest(new { message = "Stripe did not return a checkout URL." });

        _db.CartItems.RemoveRange(cart.Items);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            checkoutUrl,
            orderId = newOrder.Id,
            paymentReference = paymentRecord.Reference
        });
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        string rawPayload;
        try
        {
            Request.EnableBuffering();
            using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
            {
                rawPayload = await reader.ReadToEndAsync();
                Request.Body.Position = 0;
            }

            var signatureHeader = Request.Headers["Stripe-Signature"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(signatureHeader))
            {
                _logger.LogWarning("Stripe webhook missing signature header.");
                return BadRequest();
            }

            if (!TryConstructStripeEvent(rawPayload, signatureHeader, out var stripeEvent))
            {
                _logger.LogWarning("Stripe webhook signature validation failed for all configured secrets.");
                return BadRequest();
            }

            var trackedPayment = await ResolveTrackedPaymentAsync(stripeEvent);
            if (trackedPayment == null)
            {
                _logger.LogWarning("Stripe webhook received unknown payment event {EventType} ({EventId}).", stripeEvent.Type, stripeEvent.Id);
                return Ok();
            }

            RegisterWebhookAttempt(trackedPayment, ComputeSha256Hex(rawPayload));

            var paymentWasPaid = false;
            var paymentWasFailure = false;

            try
            {
                ApplyStripePaymentStatus(trackedPayment, stripeEvent, out paymentWasPaid, out paymentWasFailure);
                trackedPayment.LastWebhookError = null;
            }
            catch (Exception ex)
            {
                trackedPayment.LastWebhookError = TruncateError(ex.Message);
                trackedPayment.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                throw;
            }

            var order = trackedPayment.Order;
            if (order != null)
            {
                var previousOrderStatus = order.Status;
                var wasAlreadyPaid = order.IsPaid;

                var hasAnyPaidPayment = paymentWasPaid || await _db.Payments
                    .AnyAsync(p => p.OrderId == order.Id && p.Status == "paid");

                if (paymentWasPaid)
                {
                    order.Status = "paid";
                    order.IsPaid = true;
                    order.UpdatedAt = DateTime.UtcNow;
                }
                else if (!hasAnyPaidPayment
                    && paymentWasFailure
                    && string.Equals(order.Status, "pending_payment", StringComparison.OrdinalIgnoreCase))
                {
                    order.Status = string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase)
                        ? "quoted"
                        : "failed";
                    order.IsPaid = false;
                    order.UpdatedAt = DateTime.UtcNow;

                    if (string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase))
                        QuoteLifecycle.ApplyQuoteExpiration(order, DateTime.UtcNow);
                }

                await _db.SaveChangesAsync();

                if (!string.Equals(previousOrderStatus, order.Status, StringComparison.OrdinalIgnoreCase))
                {
                    var note = paymentWasPaid
                        ? $"Payment marked as paid ({trackedPayment.Reference})"
                        : $"Payment updated as {trackedPayment.Status} ({trackedPayment.Reference})";
                    await LogStatusHistoryAsync(order.Id, previousOrderStatus, order.Status, "stripe_webhook", note);
                }

                if (!wasAlreadyPaid && paymentWasPaid)
                {
                    var user = await _db.Users.FindAsync(order.UserId);
                    var paidAmount = trackedPayment.Amount > 0
                        ? trackedPayment.Amount
                        : order.QuotedPrice
                            ?? order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count)) + order.DeliveryPrice;

                    if (user != null)
                    {
                        await _emailService.SendOrderPaidEmailAsync(user.Email, user.Name, order.Id, paidAmount);
                    }

                    await _discordWebhookService.SendPaymentReceivedAsync(order, user, paidAmount);
                }
            }
            else
            {
                await _db.SaveChangesAsync();
            }

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Stripe webhook processing failed.");
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

    private async Task<Payment> CreateAndStoreStripeCheckoutAsync(
        Order order,
        decimal amount,
        string description,
        string returnUrl,
        string? customerEmail)
    {
        var payment = new Payment
        {
            OrderId = order.Id,
            Provider = "stripe",
            Reference = BuildPaymentReference(order.Id),
            Currency = _currencyCode,
            Amount = amount,
            Status = "initializing",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        try
        {
            var metadata = new Dictionary<string, string>
            {
                ["orderId"] = order.Id.ToString(),
                ["paymentId"] = payment.Id.ToString(),
                ["reference"] = payment.Reference
            };

            var amountMinor = ConvertToMinorUnits(amount);
            var successUrl = AppendQueryString(AppendQueryString(returnUrl, "payment", "return"), "session_id", "{CHECKOUT_SESSION_ID}");
            var cancelUrl = AppendQueryString(returnUrl, "payment", "cancel");

            var sessionOptions = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                PaymentMethodTypes = new List<string> { "card", "ideal", "bancontact" },
                Metadata = metadata,
                LineItems = new List<SessionLineItemOptions>
                {
                    new()
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = _currencyCode.ToLowerInvariant(),
                            UnitAmount = amountMinor,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = description
                            }
                        }
                    }
                },
                PaymentIntentData = new SessionPaymentIntentDataOptions
                {
                    Metadata = metadata
                }
            };

            if (!string.IsNullOrWhiteSpace(customerEmail))
                sessionOptions.CustomerEmail = customerEmail;

            var response = await _checkoutSessionService.CreateAsync(sessionOptions);
            payment.ProviderPaymentId = response.Id;
            payment.CheckoutUrl = response.Url;
            payment.Method = response.PaymentMethodTypes?.FirstOrDefault();
            payment.Status = NormalizeStripeStatus(response.Status, response.PaymentStatus);
            payment.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return payment;
        }
        catch (Exception ex)
        {
            payment.ProviderPaymentId = null;
            payment.CheckoutUrl = null;
            payment.Method = null;
            payment.Status = "create_failed";
            payment.FailureReason = TruncateError(ex.Message);
            payment.FailedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            throw;
        }
    }

    private async Task<Payment?> ResolveTrackedPaymentAsync(Event stripeEvent)
    {
        if (stripeEvent.Data.Object is Session session)
        {
            if (!string.IsNullOrWhiteSpace(session.Id))
            {
                var byProviderId = await _db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .FirstOrDefaultAsync(p => p.ProviderPaymentId == session.Id);
                if (byProviderId != null)
                    return byProviderId;
            }

            if (TryExtractPaymentId(session.Metadata, out var paymentId))
            {
                return await _db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .FirstOrDefaultAsync(p => p.Id == paymentId);
            }
        }

        if (stripeEvent.Data.Object is PaymentIntent paymentIntent)
        {
            if (!string.IsNullOrWhiteSpace(paymentIntent.Id))
            {
                var byProviderId = await _db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .FirstOrDefaultAsync(p => p.ProviderPaymentId == paymentIntent.Id);
                if (byProviderId != null)
                    return byProviderId;
            }

            if (TryExtractPaymentId(paymentIntent.Metadata, out var paymentId))
            {
                return await _db.Payments
                    .Include(p => p.Order)
                    .ThenInclude(o => o!.Items)
                    .FirstOrDefaultAsync(p => p.Id == paymentId);
            }
        }

        return null;
    }

    private static void ApplyStripePaymentStatus(Payment trackedPayment, Event stripeEvent, out bool paymentWasPaid, out bool paymentWasFailure)
    {
        paymentWasPaid = false;
        paymentWasFailure = false;

        var now = DateTime.UtcNow;

        switch (stripeEvent.Type)
        {
            case EventTypes.CheckoutSessionCompleted:
                if (stripeEvent.Data.Object is not Session completedSession)
                    return;

                trackedPayment.ProviderPaymentId ??= completedSession.Id;
                trackedPayment.Method = completedSession.PaymentMethodTypes?.FirstOrDefault();
                trackedPayment.Status = NormalizeStripeStatus(completedSession.Status, completedSession.PaymentStatus);
                trackedPayment.UpdatedAt = now;

                if (string.Equals(completedSession.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
                {
                    paymentWasPaid = true;
                    trackedPayment.PaidAt ??= now;
                }
                break;

            case EventTypes.CheckoutSessionExpired:
                if (stripeEvent.Data.Object is not Session expiredSession)
                    return;

                trackedPayment.ProviderPaymentId ??= expiredSession.Id;
                trackedPayment.Status = "expired";
                trackedPayment.ExpiredAt ??= now;
                trackedPayment.UpdatedAt = now;
                paymentWasFailure = true;
                break;

            case EventTypes.CheckoutSessionAsyncPaymentFailed:
                if (stripeEvent.Data.Object is not Session failedSession)
                    return;

                trackedPayment.ProviderPaymentId ??= failedSession.Id;
                trackedPayment.Status = "failed";
                trackedPayment.FailedAt ??= now;
                trackedPayment.UpdatedAt = now;
                paymentWasFailure = true;
                break;

            case EventTypes.CheckoutSessionAsyncPaymentSucceeded:
                if (stripeEvent.Data.Object is not Session asyncSucceededSession)
                    return;

                trackedPayment.ProviderPaymentId ??= asyncSucceededSession.Id;
                trackedPayment.Method = asyncSucceededSession.PaymentMethodTypes?.FirstOrDefault();
                trackedPayment.Status = "paid";
                trackedPayment.PaidAt ??= now;
                trackedPayment.UpdatedAt = now;
                paymentWasPaid = true;
                break;

            case EventTypes.PaymentIntentSucceeded:
                if (stripeEvent.Data.Object is not PaymentIntent succeededIntent)
                    return;

                trackedPayment.ProviderPaymentId ??= succeededIntent.Id;
                trackedPayment.Status = "paid";
                trackedPayment.PaidAt ??= now;
                trackedPayment.UpdatedAt = now;
                paymentWasPaid = true;
                break;

            case EventTypes.PaymentIntentPaymentFailed:
                if (stripeEvent.Data.Object is not PaymentIntent failedIntent)
                    return;

                trackedPayment.ProviderPaymentId ??= failedIntent.Id;
                trackedPayment.Status = "failed";
                trackedPayment.FailureReason = TruncateError(failedIntent.LastPaymentError?.Message);
                trackedPayment.FailedAt ??= now;
                trackedPayment.UpdatedAt = now;
                paymentWasFailure = true;
                break;

            default:
                if (stripeEvent.Data.Object is Session session)
                {
                    trackedPayment.ProviderPaymentId ??= session.Id;
                    trackedPayment.Method = session.PaymentMethodTypes?.FirstOrDefault();
                    trackedPayment.Status = NormalizeStripeStatus(session.Status, session.PaymentStatus);
                    trackedPayment.UpdatedAt = now;

                    paymentWasPaid = string.Equals(session.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase);
                    paymentWasFailure = string.Equals(session.Status, "expired", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(session.PaymentStatus, "no_payment_required", StringComparison.OrdinalIgnoreCase);

                    if (paymentWasPaid)
                        trackedPayment.PaidAt ??= now;

                    if (string.Equals(session.Status, "expired", StringComparison.OrdinalIgnoreCase))
                        trackedPayment.ExpiredAt ??= now;
                }
                break;
        }
    }

    private static bool TryExtractPaymentId(IDictionary<string, string>? metadata, out Guid paymentId)
    {
        paymentId = Guid.Empty;
        if (metadata == null)
            return false;

        return metadata.TryGetValue("paymentId", out var value)
            && Guid.TryParse(value, out paymentId);
    }

    private static string NormalizeStripeStatus(string? sessionStatus, string? paymentStatus)
    {
        if (string.Equals(paymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            return "paid";

        if (string.Equals(paymentStatus, "unpaid", StringComparison.OrdinalIgnoreCase)
            && string.Equals(sessionStatus, "open", StringComparison.OrdinalIgnoreCase))
            return "open";

        if (string.Equals(paymentStatus, "no_payment_required", StringComparison.OrdinalIgnoreCase))
            return "canceled";

        if (string.Equals(sessionStatus, "expired", StringComparison.OrdinalIgnoreCase))
            return "expired";

        if (string.Equals(sessionStatus, "complete", StringComparison.OrdinalIgnoreCase))
            return "pending";

        return string.IsNullOrWhiteSpace(paymentStatus)
            ? string.IsNullOrWhiteSpace(sessionStatus)
                ? "unknown"
                : sessionStatus.ToLowerInvariant()
            : paymentStatus.ToLowerInvariant();
    }

    private static string NormalizeCurrencyCode(string? currencyCode)
    {
        var normalized = (currencyCode ?? "EUR").Trim().ToUpperInvariant();
        return normalized.Length == 3 ? normalized : "EUR";
    }

    private static string BuildPaymentReference(Guid orderId)
        => $"PC-{orderId.ToString("N")[..8]}-{Guid.NewGuid().ToString("N")[..12]}";

    private static void RegisterWebhookAttempt(Payment payment, string payloadHash)
    {
        payment.WebhookAttemptCount += 1;
        payment.LastWebhookAt = DateTime.UtcNow;
        payment.LastWebhookPayloadHash = payloadHash;
        payment.UpdatedAt = DateTime.UtcNow;
    }

    private static string ComputeSha256Hex(string? input)
    {
        input ??= string.Empty;
        var bytes = Encoding.UTF8.GetBytes(input);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static long ConvertToMinorUnits(decimal amount)
    {
        var rounded = decimal.Round(amount, 2, MidpointRounding.AwayFromZero);
        return (long)(rounded * 100m);
    }

    private static string AppendQueryString(string url, string key, string value)
    {
        var separator = url.Contains('?') ? "&" : "?";
        return $"{url}{separator}{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value)}";
    }

    private static string TruncateError(string? error)
    {
        if (string.IsNullOrWhiteSpace(error))
            return "Unknown webhook processing error.";

        return error.Length > 1024 ? error[..1024] : error;
    }

    private static IReadOnlyList<string> LoadStripeWebhookSecrets(IConfiguration configuration)
    {
        var single = configuration["StripeWebhookSecret"];
        var list = configuration["StripeWebhookSecrets"];

        var secrets = new List<string>();

        if (!string.IsNullOrWhiteSpace(single))
            secrets.Add(single.Trim());

        if (!string.IsNullOrWhiteSpace(list))
        {
            var split = list
                .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Where(s => !string.IsNullOrWhiteSpace(s));
            secrets.AddRange(split);
        }

        if (secrets.Count == 0)
        {
            throw new InvalidOperationException(
                "StripeWebhookSecret (or StripeWebhookSecrets) must be configured via environment variables.");
        }

        return secrets
            .Distinct(StringComparer.Ordinal)
            .ToArray();
    }

    private bool TryConstructStripeEvent(string payload, string signatureHeader, out Event stripeEvent)
    {
        foreach (var secret in _stripeWebhookSecrets)
        {
            try
            {
                stripeEvent = EventUtility.ConstructEvent(payload, signatureHeader, secret);
                return true;
            }
            catch
            {
                // Try next configured secret.
            }
        }

        stripeEvent = null!;
        return false;
    }
}

public record CheckoutRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string City,
    string PostalCode
);
