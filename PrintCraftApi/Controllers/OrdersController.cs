using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        PrintCraftDb db,
        IWebHostEnvironment env,
        IEmailService emailService,
        IDiscordWebhookService discordWebhookService,
        ILogger<OrdersController> logger)
    {
        _db = db;
        _env = env;
        _emailService = emailService;
        _discordWebhookService = discordWebhookService;
        _logger = logger;
    }

    private static bool IsPendingStatus(string? status)
    {
        return !string.IsNullOrWhiteSpace(status)
            && status.StartsWith("pending", StringComparison.OrdinalIgnoreCase);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
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
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
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
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
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
    public async Task<IActionResult> CreateQuote([FromBody] QuoteRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

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

        if (request.Items.Any(i => i.Count > 100))
        {
            return BadRequest(new { message = "Item quantity cannot exceed 100 per model." });
        }

        var userId = Guid.Parse(userIdStr);
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return Unauthorized(new { message = "User account no longer exists. Please log in again." });

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
            FullName = user.Name?.Trim() ?? string.Empty,
            PhoneNumber = string.Empty,
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
        await LogStatusHistoryAsync(order.Id, null, order.Status, "customer", "Quote requested");

        _logger.LogInformation("About to send Discord quote notification for order {OrderId}", order.Id);
        try
        {
            _logger.LogInformation("Discord webhook service is available, calling SendQuoteRequestedAsync");
            await _discordWebhookService.SendQuoteRequestedAsync(order, user);
            _logger.LogInformation("Discord webhook call completed for order {OrderId}", order.Id);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed sending quote Discord notification for order {OrderId}", order.Id);
        }

        try
        {
            var userName = string.IsNullOrWhiteSpace(user.Name) ? user.Email : user.Name;
            await _emailService.SendQuoteRequestedEmailAsync(user.Email, userName, order.Id);
            await LogOrderCommunicationAsync(
                order.Id,
                "quote_requested",
                "Quote request received",
                user.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed sending quote-requested email for order {OrderId}", order.Id);
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, MapOrderForCustomer(order));
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

        if (!IsPendingStatus(order.Status))
            return BadRequest(new { message = "Only pending orders can be cancelled." });

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
            order.QuotedPrice,
            order.QuoteMessage,
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

public record QuoteRequest(List<QuoteItemRequest> Items);

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
