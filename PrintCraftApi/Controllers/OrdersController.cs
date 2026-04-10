using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PrintCraftApi.Configuration;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using PrintCraftApi.Validation;
using PrintCraftApi.Services;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IWebHostEnvironment _env;
    private readonly IEmailService _emailService;
    private readonly IDiscordWebhookService _discordWebhookService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        PrintCraftDb db,
        IWebHostEnvironment env,
        IEmailService emailService,
        IDiscordWebhookService discordWebhookService,
        IConfiguration configuration,
        ILogger<OrdersController> logger)
    {
        _db = db;
        _env = env;
        _emailService = emailService;
        _discordWebhookService = discordWebhookService;
        _configuration = configuration;
        _logger = logger;
    }

    private static bool IsPendingStatus(string? status)
    {
        return !string.IsNullOrWhiteSpace(status)
            && status.StartsWith("pending", StringComparison.OrdinalIgnoreCase);
    }

    private static bool CanCustomerCancelOrder(string? status)
    {
        if (IsPendingStatus(status)) return true;
        return string.Equals(status, "quoted", StringComparison.OrdinalIgnoreCase);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdStr = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Include(o => o.Notes)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        await RefreshQuoteStatusesAsync(orders, "system");

        return Ok(orders.Select(MapOrderForCustomer));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var userIdStr = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Include(o => o.Notes)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order != null)
            await RefreshQuoteStatusesAsync(new[] { order }, "system");

        return order != null ? Ok(MapOrderForCustomer(order)) : NotFound(new { message = "Order not found or access denied." });
    }

    [HttpGet("{id:guid}/payments")]
    public async Task<IActionResult> GetPayments([FromRoute] Guid id)
    {
        var userIdStr = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

        var orderExists = await _db.Orders.AnyAsync(o => o.Id == id && o.UserId == userId);
        if (!orderExists)
            return NotFound(new { message = "Order not found or access denied." });

        var payments = await _db.Payments
            .Where(p => p.OrderId == id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(payments);
    }

    [HttpPost("quote")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateQuote([FromBody] QuoteRequest request)
    {
        var isAuthenticated = User?.Identity?.IsAuthenticated == true;
        var userIdStr = User?.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = null;
        User? user = null;
        string? guestEmail = null;
        string? guestName = null;
        string? guestPhone = null;

        if (isAuthenticated)
        {
            if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out var parsedUserId))
                return Unauthorized();

            userId = parsedUserId;
            user = await _db.Users.FindAsync(parsedUserId);
            if (user == null)
                return Unauthorized(new { message = "User account no longer exists. Please log in again." });
        }
        else
        {
            guestName = request.GuestName?.Trim();
            guestEmail = request.GuestEmail?.Trim().ToLowerInvariant();
            guestPhone = request.GuestPhone?.Trim();

            if (string.IsNullOrWhiteSpace(guestName) || guestName.Length < 2 || guestName.Length > 80)
                return BadRequest(new { message = "Guest full name must be between 2 and 80 characters." });

            if (!IsValidEmail(guestEmail))
                return BadRequest(new { message = "A valid guest email is required." });
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one model is required for a quote." });
        }

        if (request.Items.Any(i => i.Count <= 0))
        {
            return BadRequest(new { message = "Each quote item must include a valid quantity." });
        }

        if (request.Items.Any(i => string.IsNullOrWhiteSpace(i.FileUrl) && string.IsNullOrWhiteSpace(i.Notes)))
        {
            return BadRequest(new { message = "Each quote item must include either a file or description." });
        }

        if (request.Items.Any(i => i.Count > AppLimits.MaxItemQuantity))
        {
            return BadRequest(new { message = $"Item quantity cannot exceed {AppLimits.MaxItemQuantity} per model." });
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = "pending_quote",
            OrderType = "quote",
            IsPaid = false,
            QuotedPrice = null,
            QuoteMessage = null,
            FullName = user?.Name?.Trim() ?? guestName ?? string.Empty,
            PhoneNumber = guestPhone ?? string.Empty,
            AddressLine1 = string.Empty,
            City = string.Empty,
            PostalCode = string.Empty,
            Items = request.Items.Select(item => new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = Guid.Empty,
                FileUrl = string.IsNullOrWhiteSpace(item.FileUrl) ? null : item.FileUrl.Trim(),
                fileName = string.IsNullOrWhiteSpace(item.FileName) ? null : item.FileName.Trim(),
                Notes = string.IsNullOrWhiteSpace(item.Notes) ? null : item.Notes.Trim(),
                Material = string.IsNullOrWhiteSpace(item.Material) ? "Custom" : item.Material.Trim(),
                Color = string.IsNullOrWhiteSpace(item.Color) ? "Custom" : item.Color.Trim(),
                Count = item.Count,
                Price = 0,
            }).ToList(),
        };

        if (order.Items != null)
        {
            foreach (var item in order.Items)
            {
                item.OrderId = order.Id;
            }
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(
            order.Id,
            null,
            order.Status,
            user == null ? "guest" : "customer",
            "Quote requested");

        if (user == null && !string.IsNullOrWhiteSpace(guestEmail))
        {
            _db.OrderNotes.Add(new OrderNote
            {
                OrderId = order.Id,
                Content = string.IsNullOrWhiteSpace(guestPhone)
                    ? $"Guest quote contact email: {guestEmail}"
                    : $"Guest quote contact email: {guestEmail}; phone: {guestPhone}",
                Visibility = "internal",
                CreatedBy = "system",
                CreatedAt = DateTime.UtcNow,
            });
            await _db.SaveChangesAsync();
        }

        _logger.LogInformation("About to send Discord quote notification for order {OrderId}", order.Id);
        try
        {
            _logger.LogInformation("Discord webhook service is available, calling SendQuoteRequestedAsync");
            await _discordWebhookService.SendQuoteRequestedAsync(order, user, guestEmail);
            _logger.LogInformation("Discord webhook call completed for order {OrderId}", order.Id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed sending quote Discord notification for order {OrderId}", order.Id);
        }

        try
        {
            var recipientEmail = user?.Email ?? guestEmail;
            var recipientName = string.IsNullOrWhiteSpace(user?.Name)
                ? (user?.Email ?? guestName ?? "Customer")
                : user!.Name;

            if (!string.IsNullOrWhiteSpace(recipientEmail))
            {
                await _emailService.SendQuoteRequestedEmailAsync(recipientEmail, recipientName, order.Id);
                await LogOrderCommunicationAsync(
                    order.Id,
                    "quote_requested",
                    "Quote request received",
                    recipientEmail);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed sending quote-requested email for order {OrderId}", order.Id);
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapOrderForCustomer(order));
    }

    [HttpPost("guest/access-link")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthBurst")]
    public async Task<IActionResult> SendGuestAccessLink([FromBody] GuestOrderAccessLinkRequest request)
    {
        var normalizedEmail = request.Email?.Trim().ToLowerInvariant();
        if (!Guid.TryParse(request.OrderId?.Trim(), out var orderId))
            return BadRequest(new { message = "A valid order reference is required." });

        if (!IsValidEmail(normalizedEmail))
            return BadRequest(new { message = "A valid email is required." });

        var order = await _db.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null || order.UserId.HasValue)
            return Ok(new { message = "If the details match, an access link was sent." });

        var emailMatches = await IsGuestOrderEmailMatchAsync(order.Id, normalizedEmail!);
        if (!emailMatches)
            return Ok(new { message = "If the details match, an access link was sent." });

        var token = GenerateGuestOrderAccessToken(order.Id, normalizedEmail!);
        var frontendBaseUrl = GetRequiredConfig("FrontendBaseUrl").TrimEnd('/');
        var accessLink = $"{frontendBaseUrl}/quote/access?token={Uri.EscapeDataString(token)}";

        try
        {
            var toName = string.IsNullOrWhiteSpace(order.FullName)
                ? normalizedEmail!
                : order.FullName.Trim();
            await _emailService.SendGuestOrderAccessEmailAsync(normalizedEmail!, toName, order.Id, accessLink);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed sending guest access link for order {OrderId}", order.Id);
        }

        return Ok(new { message = "If the details match, an access link was sent." });
    }

    [HttpGet("guest/access")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGuestOrderByAccessToken([FromQuery] string? token)
    {
        var resolved = ValidateGuestOrderAccessToken(token);
        if (resolved == null)
            return Unauthorized(new { message = "Access link is invalid or expired." });

        var order = await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.Payments)
            .Include(o => o.Notes)
            .FirstOrDefaultAsync(o => o.Id == resolved.Value.OrderId);

        if (order == null || order.UserId.HasValue)
            return NotFound(new { message = "Order not found." });

        var emailMatches = await IsGuestOrderEmailMatchAsync(order.Id, resolved.Value.Email);
        if (!emailMatches)
            return Unauthorized(new { message = "Access link is invalid." });

        await RefreshQuoteStatusesAsync(new[] { order }, "system");
        return Ok(MapOrderForCustomer(order));
    }

    private static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task<bool> IsGuestOrderEmailMatchAsync(Guid orderId, string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var foundCommunicationMatch = await _db.OrderCommunications
            .AsNoTracking()
            .AnyAsync(c => c.OrderId == orderId
                && c.RecipientEmail != null
                && c.RecipientEmail.ToLower() == normalizedEmail);
        if (foundCommunicationMatch)
            return true;

        var internalNotes = await _db.OrderNotes
            .AsNoTracking()
            .Where(n => n.OrderId == orderId && n.Visibility == "internal")
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => n.Content)
            .ToListAsync();

        foreach (var content in internalNotes)
        {
            if (TryExtractGuestEmailFromNote(content, out var extracted)
                && string.Equals(extracted, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static bool TryExtractGuestEmailFromNote(string? content, out string email)
    {
        email = string.Empty;
        if (string.IsNullOrWhiteSpace(content)) return false;

        const string prefix = "Guest quote contact email:";
        var idx = content.IndexOf(prefix, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return false;

        var value = content[(idx + prefix.Length)..].Trim();
        var semicolonIdx = value.IndexOf(';');
        if (semicolonIdx >= 0)
            value = value[..semicolonIdx].Trim();

        if (!IsValidEmail(value)) return false;
        email = value.Trim().ToLowerInvariant();
        return true;
    }

    private string GenerateGuestOrderAccessToken(Guid orderId, string email)
    {
        var key = GetJwtSigningKey();
        var tokenHandler = new JwtSecurityTokenHandler();
        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("purpose", "guest_order_access"),
                new Claim("order_id", orderId.ToString()),
                new Claim(ClaimTypes.Email, email.Trim().ToLowerInvariant()),
            }),
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
        };

        var token = tokenHandler.CreateToken(descriptor);
        return tokenHandler.WriteToken(token);
    }

    private (Guid OrderId, string Email)? ValidateGuestOrderAccessToken(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        var key = GetJwtSigningKey();
        var tokenHandler = new JwtSecurityTokenHandler();

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
            }, out _);

            var purpose = principal.FindFirst("purpose")?.Value;
            if (!string.Equals(purpose, "guest_order_access", StringComparison.Ordinal))
                return null;

            var orderIdValue = principal.FindFirst("order_id")?.Value;
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;

            if (!Guid.TryParse(orderIdValue, out var orderId))
                return null;

            if (!IsValidEmail(email))
                return null;

            return (orderId, email!.Trim().ToLowerInvariant());
        }
        catch
        {
            return null;
        }
    }

    private byte[] GetJwtSigningKey()
    {
        var secret = _configuration["JwtSecret"];
        if (string.IsNullOrWhiteSpace(secret) || secret.Length < 32)
            throw new InvalidOperationException("JwtSecret must be configured and at least 32 characters long.");

        return Encoding.ASCII.GetBytes(secret);
    }

    private string GetRequiredConfig(string key)
    {
        var value = _configuration[key];
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{key} must be configured via environment variables.");

        return value;
    }

    [HttpPut("{id:guid}/shipping")]
    public async Task<IActionResult> SaveQuoteShipping([FromRoute] Guid id, [FromBody] SaveQuoteShippingRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order == null)
            return NotFound(new { message = "Order not found." });

        if (!string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Shipping can only be updated for quote orders." });

        if (order.IsPaid)
            return BadRequest(new { message = "Paid orders cannot be updated." });

        var shippingValidation = ShippingInfoValidator.Validate(
            request.FullName,
            request.PhoneNumber,
            request.AddressLine1,
            request.City,
            request.PostalCode);

        if (!shippingValidation.IsValid)
        {
            return BadRequest(new
            {
                message = "Please correct shipping info and try again.",
                errors = shippingValidation.Errors
            });
        }

        order.FullName = shippingValidation.FullName;
        order.PhoneNumber = shippingValidation.PhoneNumber;
        order.AddressLine1 = shippingValidation.AddressLine1;
        order.City = shippingValidation.City;
        order.PostalCode = shippingValidation.PostalCode;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(MapOrderForCustomer(order));
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder([FromRoute] Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound(new { message = "Order not found." });

        if (!CanCustomerCancelOrder(order.Status))
            return BadRequest(new { message = "Only pending or quoted orders can be cancelled." });

        var previousStatus = order.Status;
        order.Status = "cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "user", "Order cancelled by user");

        return Ok(new { message = "Order cancelled.", orderId = id });
    }

    [HttpPost("{id:guid}/request-new-quote")]
    public async Task<IActionResult> RequestNewQuote([FromRoute] Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound(new { message = "Order not found." });

        if (!string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only quote orders can request a new quote." });

        if (order.IsPaid)
            return BadRequest(new { message = "Paid orders cannot request a new quote." });

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

        if (!string.Equals(order.Status, "expired_quote", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "A new quote can be requested only after the previous quote expires." });

        var previousStatus = order.Status;
        order.Status = "pending_quote";
        order.QuotedPrice = null;
        order.QuoteMessage = null;
        QuoteLifecycle.ClearQuoteWindow(order);
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "customer", "Customer requested a new quote after expiration");

        return Ok(MapOrderForCustomer(order));
    }

    private async Task RefreshQuoteStatusesAsync(IEnumerable<Order> orders, string changedBy)
    {
        var transitions = new List<(Guid OrderId, string PreviousStatus, string NewStatus, string Note)>();
        var changed = false;

        foreach (var order in orders)
        {
            var previousStatus = order.Status;
            var result = QuoteLifecycle.ApplyQuoteExpiration(order, DateTime.UtcNow);
            if (!result.HasChanges)
                continue;

            changed = true;

            if (result.StatusChanged)
            {
                transitions.Add((
                    order.Id,
                    previousStatus,
                    order.Status,
                    "Quote expired after 7 days without payment"));
            }
        }

        if (!changed)
            return;

        await _db.SaveChangesAsync();

        foreach (var transition in transitions)
        {
            await LogStatusHistoryAsync(
                transition.OrderId,
                transition.PreviousStatus,
                transition.NewStatus,
                changedBy,
                transition.Note);
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

    private async Task LogOrderCommunicationAsync(Guid orderId, string type, string subject, string recipientEmail)
    {
        _db.OrderCommunications.Add(new OrderCommunication
        {
            OrderId = orderId,
            Channel = "email",
            CommunicationType = type,
            Subject = subject,
            RecipientEmail = recipientEmail,
            SentAt = DateTime.UtcNow,
        });

        await _db.SaveChangesAsync();
    }

    private object MapOrderForCustomer(Order order)
    {
        var noteItems = new List<object>();

        if (order.Notes != null)
        {
            noteItems.AddRange(order.Notes
                .Where(n => string.Equals(n.Visibility, "customer", StringComparison.OrdinalIgnoreCase))
                .OrderBy(n => n.CreatedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Content,
                    n.Visibility,
                    n.CreatedBy,
                    n.CreatedAt,
                }));
        }

        // Backward-compatibility for older orders that only used the single CustomerNotes field.
        if (string.IsNullOrWhiteSpace(order.CustomerNotes) == false
            && noteItems.Count == 0)
        {
            noteItems.Add(new
            {
                Id = Guid.Empty,
                Content = order.CustomerNotes,
                Visibility = "customer",
                CreatedBy = "admin",
                CreatedAt = order.UpdatedAt,
            });
        }

        return new
        {
            order.Id,
            order.UserId,
            order.Status,
            order.OrderType,
            order.FullName,
            order.AddressLine1,
            order.AddressLine2,
            order.City,
            order.PostalCode,
            order.PhoneNumber,
            order.DeliveryPrice,
            order.OrderDiscountAmount,
            order.SubtotalAmount,
            order.DiscountAmount,
            order.FinalTotalAmount,
            order.ServiceFeePrice,
            order.QuotedPrice,
            order.QuoteConfirmedAt,
            order.QuoteExpiresAt,
            order.TrackingCode,
            order.TrackingUrl,
            CustomerNotes = order.CustomerNotes,
            InternalNotes = (string?)null,
            order.IsPaid,
            order.UpdatedAt,
            order.CreatedAt,
            order.Items,
            order.Payments,
            Notes = noteItems,
        };
    }

    private void DeleteUploadFileIfExists(string? rawUrl)
    {
        if (string.IsNullOrWhiteSpace(rawUrl)) return;
        if (string.IsNullOrWhiteSpace(_env.WebRootPath)) return;

        var path = rawUrl.Trim();
        if (Uri.TryCreate(path, UriKind.Absolute, out var absoluteUri))
        {
            path = absoluteUri.AbsolutePath;
        }

        var normalizedPath = path.Replace('\\', '/');
        if (!normalizedPath.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            return;

        var fileName = Path.GetFileName(normalizedPath);
        if (string.IsNullOrWhiteSpace(fileName)) return;
        if (fileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0) return;

        var uploadsRoot = Path.GetFullPath(Path.Combine(_env.WebRootPath, "uploads"));
        var filePath = Path.GetFullPath(Path.Combine(uploadsRoot, fileName));

        if (!filePath.StartsWith(uploadsRoot + Path.DirectorySeparatorChar, StringComparison.Ordinal))
            return;

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }
    }

}

public record QuoteRequest(
    List<QuoteItemRequest> Items,
    string? GuestName,
    string? GuestEmail,
    string? GuestPhone
);

public record GuestOrderAccessLinkRequest(
    string? OrderId,
    string? Email
);

public record QuoteItemRequest(
    string? FileUrl,
    string? FileName,
    string? Notes,
    string? Material,
    string? Color,
    int Count
);

public record SaveQuoteShippingRequest(
    string FullName,
    string PhoneNumber,
    string AddressLine1,
    string City,
    string PostalCode
);
