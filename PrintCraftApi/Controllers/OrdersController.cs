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
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        PrintCraftDb db,
        IWebHostEnvironment env,
        IEmailService emailService,
        ILogger<OrdersController> logger)
    {
        _db = db;
        _env = env;
        _emailService = emailService;
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

        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);

        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        return order != null ? Ok(order) : NotFound(new { message = "Order not found or access denied." });
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
            FullName = user?.Name?.Trim() ?? string.Empty,
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

        try
        {
            if (user != null)
            {
                await _emailService.SendQuoteRequestedEmailAsync(user.Email, user.Name, order.Id);
                await LogOrderCommunicationAsync(
                    order.Id,
                    "quote_requested",
                    "Quote request received",
                    user.Email);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed sending quote-requested email for order {OrderId}", order.Id);
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPut("{id:guid}/shipping")]
    public async Task<IActionResult> SaveQuoteShipping([FromRoute] Guid id, [FromBody] SaveQuoteShippingRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);

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

        return Ok(order);
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder([FromRoute] Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);

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
