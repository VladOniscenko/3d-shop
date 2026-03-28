using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using System.IO;
using PrintCraftApi.Services;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private const string DefaultQuoteConfirmationMessage = "Thank you for your quote request. We reviewed your files and determined the production cost based on materials, print time, and finishing. You can now confirm and pay for your quote in your personal portal.";
    private static readonly HashSet<string> KnownStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "pending",
        "pending_quote",
        "quoted",
        "pending_payment",
        "printing",
        "completed",
        "paid",
        "shipped",
        "sent",
        "delivered",
        "failed",
        "cancelled",
    };

    private static readonly HashSet<string> PostPaymentStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "paid",
        "printing",
        "sent",
        "delivered",
        "completed",
    };

    private static bool IsPendingStatus(string? status)
    {
        return !string.IsNullOrWhiteSpace(status)
            && status.StartsWith("pending", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeStatus(string? status)
        => string.IsNullOrWhiteSpace(status) ? string.Empty : status.Trim().ToLowerInvariant();

    private static bool IsKnownStatus(string? status)
        => KnownStatuses.Contains(NormalizeStatus(status));

    private static bool IsPricingLocked(Order order)
    {
        if (order.IsPaid) return true;

        var status = NormalizeStatus(order.Status);
        return status is "paid" or "printing" or "sent" or "delivered" or "completed";
    }

    private static bool CanTransitionStatus(string? currentStatus, string? nextStatus, bool isPaid)
    {
        var current = NormalizeStatus(currentStatus);
        var next = NormalizeStatus(nextStatus);

        if (string.IsNullOrWhiteSpace(next)) return false;
        if (!IsKnownStatus(next)) return false;
        if (string.Equals(current, next, StringComparison.OrdinalIgnoreCase)) return true;

        if (current is "cancelled" or "completed")
            return false;

        if (isPaid || string.Equals(current, "paid", StringComparison.OrdinalIgnoreCase))
            return PostPaymentStatuses.Contains(next);

        return true;
    }

    private static decimal CalculateSubtotal(Order order)
    {
        return order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count));
    }

    private static void RecalculateQuotedPrice(Order order)
    {
        var normalizedDelivery = Math.Max(order.DeliveryPrice, 0m);
        var normalizedDiscount = Math.Max(order.OrderDiscountAmount, 0m);
        var subtotal = CalculateSubtotal(order);
        var total = Math.Max(subtotal + normalizedDelivery - normalizedDiscount, 0m);

        order.DeliveryPrice = normalizedDelivery;
        order.OrderDiscountAmount = normalizedDiscount;
        order.QuotedPrice = total > 0 ? total : null;
    }

    [HttpPut("orders/{id:guid}/paid")]
    public async Task<IActionResult> MarkPaid([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, "paid", order.IsPaid))
            return BadRequest(new { message = "Paid status is not allowed from the current state." });

        var previousStatus = order.Status;
        order.Status = "paid";
        order.IsPaid = true;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Marked as paid");

        return Ok(order);
    }
    private readonly PrintCraftDb _db;
    private readonly IEmailService _emailService;

    public AdminController(PrintCraftDb db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalUsers = await _db.Users.CountAsync();
        var totalOrders = await _db.Orders.CountAsync();
        var pendingOrders = await _db.Orders.CountAsync(o => o.Status == "pending_quote" || o.Status == "pending" || o.Status == "quoted");

        var recentOrders = await _db.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .ToListAsync();

        return Ok(new
        {
            totalUsers,
            totalOrders,
            pendingOrders,
            recentOrders
        });
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortDir,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Orders
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            var q = search.ToLower();
            query = query.Where(o => o.FullName.ToLower().Contains(q)
                || o.AddressLine1.ToLower().Contains(q)
                || o.City.ToLower().Contains(q)
                || o.PhoneNumber.ToLower().Contains(q)
                || o.Status.ToLower().Contains(q)
                || (!string.IsNullOrEmpty(o.QuoteMessage) && o.QuoteMessage.ToLower().Contains(q))
            );
        }

        if (!string.IsNullOrEmpty(status) && status != "All")
            query = query.Where(o => o.Status == status);

        query = sortBy?.ToLower() switch
        {
            "createdat" => sortDir?.ToLower() == "desc"
                ? query.OrderByDescending(o => o.CreatedAt)
                : query.OrderBy(o => o.CreatedAt),
            "status" => sortDir?.ToLower() == "desc"
                ? query.OrderByDescending(o => o.Status)
                : query.OrderBy(o => o.Status),
            "quotedprice" => sortDir?.ToLower() == "desc"
                ? query.OrderByDescending(o => o.QuotedPrice)
                : query.OrderBy(o => o.QuotedPrice),
            _ => query.OrderByDescending(o => o.CreatedAt),
        };

        var totalCount = await query.CountAsync();
        var results = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { results, totalCount, page, pageSize });
    }

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrderById([FromRoute] Guid id)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order == null ? NotFound(new { message = "Order not found" }) : Ok(order);
    }

    [HttpGet("orders/{id:guid}/communications")]
    public async Task<IActionResult> GetOrderCommunications([FromRoute] Guid id)
    {
        var exists = await _db.Orders.AnyAsync(o => o.Id == id);
        if (!exists) return NotFound(new { message = "Order not found" });

        var entries = await _db.OrderCommunications
            .Where(c => c.OrderId == id)
            .OrderByDescending(c => c.SentAt)
            .ToListAsync();

        return Ok(entries);
    }

    [HttpGet("orders/{id:guid}/status-history")]
    public async Task<IActionResult> GetOrderStatusHistory([FromRoute] Guid id)
    {
        var exists = await _db.Orders.AnyAsync(o => o.Id == id);
        if (!exists) return NotFound(new { message = "Order not found" });

        var entries = await _db.OrderStatusHistory
            .Where(s => s.OrderId == id)
            .OrderByDescending(s => s.ChangedAt)
            .ToListAsync();

        return Ok(entries);
    }

    [HttpPut("orders/{id:guid}")]
    public async Task<IActionResult> UpdateOrder([FromRoute] Guid id, [FromBody] Order updated)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, updated.Status, order.IsPaid))
            return BadRequest(new { message = "Invalid status transition for this order." });

        if (order.IsPaid && !updated.IsPaid)
            return BadRequest(new { message = "Paid flag cannot be reverted once payment is completed." });

        if (IsPricingLocked(order)
            && (updated.DeliveryPrice != order.DeliveryPrice
                || updated.OrderDiscountAmount != order.OrderDiscountAmount))
        {
            return BadRequest(new { message = "Pricing cannot be changed after payment or production progress." });
        }

        var previousStatus = order.Status;
        order.FullName = updated.FullName;
        order.AddressLine1 = updated.AddressLine1;
        order.AddressLine2 = updated.AddressLine2;
        order.City = updated.City;
        order.PostalCode = updated.PostalCode;
        order.PhoneNumber = updated.PhoneNumber;
        order.Status = updated.Status;
        if (!IsPricingLocked(order))
        {
            order.DeliveryPrice = updated.DeliveryPrice < 0 ? 0 : updated.DeliveryPrice;
            order.OrderDiscountAmount = updated.OrderDiscountAmount < 0 ? 0 : updated.OrderDiscountAmount;
            RecalculateQuotedPrice(order);
        }
        order.QuoteMessage = updated.QuoteMessage;
        order.TrackingCode = string.IsNullOrWhiteSpace(updated.TrackingCode)
            ? null
            : updated.TrackingCode.Trim();
        order.TrackingUrl = string.IsNullOrWhiteSpace(updated.TrackingUrl)
            ? null
            : updated.TrackingUrl.Trim();
        order.InternalNotes = updated.InternalNotes;
        order.CustomerNotes = updated.CustomerNotes;
        order.IsPaid = updated.IsPaid;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Order updated");

        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus([FromRoute] Guid id, [FromBody] UpdateOrderStatusRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, payload.Status, order.IsPaid))
            return BadRequest(new { message = "Invalid status transition for this order." });

        var nextStatus = NormalizeStatus(payload.Status);
        var previousStatus = order.Status;
        order.Status = nextStatus;
        if (string.Equals(nextStatus, "paid", StringComparison.OrdinalIgnoreCase))
            order.IsPaid = true;

        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Status updated");

        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/customer")]
    public async Task<IActionResult> UpdateOrderCustomer([FromRoute] Guid id, [FromBody] UpdateOrderCustomerRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.FullName = payload.FullName;
        order.AddressLine1 = payload.AddressLine1;
        order.AddressLine2 = payload.AddressLine2;
        order.City = payload.City;
        order.PostalCode = payload.PostalCode;
        order.PhoneNumber = payload.PhoneNumber;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/quote")]
    public async Task<IActionResult> DoQuote([FromRoute] Guid id, [FromBody] QuoteRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (IsPricingLocked(order))
            return BadRequest(new { message = "Pricing cannot be changed after payment or production progress." });

        var previousStatus = order.Status;
        order.QuotedPrice = payload.Price;
        order.QuoteMessage = payload.Message;
        order.Status = "quoted";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Quote prepared");

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmOrder([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, "printing", order.IsPaid))
            return BadRequest(new { message = "Cannot confirm this order." });

        var previousStatus = order.Status;
        order.Status = "printing";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Started printing");

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/sent")]
    public async Task<IActionResult> MarkSent([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, "sent", order.IsPaid))
            return BadRequest(new { message = "Cannot mark this order as sent from the current status." });

        var previousStatus = order.Status;
        order.Status = "sent";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Order sent");

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/delivered")]
    public async Task<IActionResult> MarkDelivered([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!CanTransitionStatus(order.Status, "delivered", order.IsPaid))
            return BadRequest(new { message = "Cannot mark this order as delivered from the current status." });

        var previousStatus = order.Status;
        order.Status = "delivered";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Order delivered");

        return Ok(order);
    }

    [HttpDelete("orders/{id:guid}")]
    public async Task<IActionResult> DeleteOrder([FromRoute] Guid id)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (!IsPendingStatus(order.Status))
            return BadRequest(new { message = "Only pending orders can be deleted." });

        // Delete associated files
        foreach (var item in order.Items)
        {
            if (!string.IsNullOrEmpty(item.FileUrl))
            {
                DeleteUploadFileIfExists(item.FileUrl);
            }
        }

        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        if (page <= 0) page = 1;
        if (pageSize <= 0) pageSize = 20;

        var query = _db.Users.AsQueryable();
        if (!string.IsNullOrEmpty(search))
        {
            var q = search.ToLower();
            query = query.Where(u => u.Name.ToLower().Contains(q) || u.Email.ToLower().Contains(q) || u.Role.ToLower().Contains(q));
        }

        var totalCount = await query.CountAsync();
        var results = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        return Ok(new { results, totalCount, page, pageSize });
    }

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUserById([FromRoute] Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        return user == null ? NotFound(new { message = "User not found" }) : Ok(user);
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser([FromRoute] Guid id, [FromBody] User updated)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        user.Name = updated.Name;
        user.Email = updated.Email;
        user.Role = updated.Role;

        await _db.SaveChangesAsync();
        return Ok(user);
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser([FromRoute] Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "User not found" });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("orders/{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> UpdateOrderItem([FromRoute] Guid id, [FromRoute] Guid itemId, [FromBody] UpdateItemRequest payload)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (IsPricingLocked(order))
            return BadRequest(new { message = "Pricing cannot be changed after payment or production progress." });

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) return NotFound(new { message = "Item not found" });

        if (payload.Price < 0)
            return BadRequest(new { message = "Item price cannot be negative." });

        item.Price = payload.Price;
        RecalculateQuotedPrice(order);
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/delivery-price")] // PATCH for partial update
    public async Task<IActionResult> UpdateDeliveryPrice([FromRoute] Guid id, [FromBody] DeliveryPriceRequest payload)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (IsPricingLocked(order))
            return BadRequest(new { message = "Pricing cannot be changed after payment or production progress." });

        if (payload.DeliveryPrice < 0)
            return BadRequest(new { message = "Delivery price cannot be negative." });

        order.DeliveryPrice = payload.DeliveryPrice;
        RecalculateQuotedPrice(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/order-discount")]
    public async Task<IActionResult> UpdateOrderDiscount([FromRoute] Guid id, [FromBody] OrderDiscountRequest payload)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (IsPricingLocked(order))
            return BadRequest(new { message = "Pricing cannot be changed after payment or production progress." });

        if (payload.OrderDiscountAmount < 0)
            return BadRequest(new { message = "Order discount cannot be negative." });

        order.OrderDiscountAmount = payload.OrderDiscountAmount;
        RecalculateQuotedPrice(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/tracking")]
    public async Task<IActionResult> UpdateTracking([FromRoute] Guid id, [FromBody] TrackingRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.TrackingCode = string.IsNullOrWhiteSpace(payload.TrackingCode)
            ? null
            : payload.TrackingCode.Trim();
        order.TrackingUrl = string.IsNullOrWhiteSpace(payload.TrackingUrl)
            ? null
            : payload.TrackingUrl.Trim();
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/notes")]
    public async Task<IActionResult> UpdateNotes([FromRoute] Guid id, [FromBody] NotesRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.InternalNotes = string.IsNullOrWhiteSpace(payload.InternalNotes)
            ? null
            : payload.InternalNotes.Trim();
        order.CustomerNotes = string.IsNullOrWhiteSpace(payload.CustomerNotes)
            ? null
            : payload.CustomerNotes.Trim();
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(order);
    }

    [HttpPost("orders/{id:guid}/email")]
    public async Task<IActionResult> SendOrderEmail([FromRoute] Guid id, [FromBody] SendOrderEmailRequest payload)
    {
        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        var user = await _db.Users.FindAsync(order.UserId);
        if (user == null) return NotFound(new { message = "Customer not found for order" });

        var type = payload.Type?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(type))
            return BadRequest(new { message = "Email type is required." });

        switch (type)
        {
            case "quote_requested":
                await _emailService.SendQuoteRequestedEmailAsync(user.Email, user.Name, order.Id);
                await LogOrderCommunicationAsync(order.Id, "quote_requested", "Quote request received", user.Email);
                return Ok(new { message = "Quote requested email sent." });

            case "quote_confirmation":
                RecalculateQuotedPrice(order);
                var quotePrice = order.QuotedPrice ?? 0m;
                if (quotePrice <= 0)
                    return BadRequest(new { message = "Quote total must be greater than zero. Set item and delivery prices first." });

                var quoteMessage = string.IsNullOrWhiteSpace(payload.Message)
                    ? DefaultQuoteConfirmationMessage
                    : payload.Message.Trim();

                order.QuoteMessage = quoteMessage;
                if (!string.Equals(order.Status, "paid", StringComparison.OrdinalIgnoreCase)
                    && !string.Equals(order.Status, "cancelled", StringComparison.OrdinalIgnoreCase))
                {
                    var previousStatus = order.Status;
                    order.Status = "quoted";
                    await LogStatusHistoryAsync(order.Id, previousStatus, order.Status, "admin", "Quote confirmation email sent");
                }
                order.UpdatedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();

                await _emailService.SendQuoteConfirmationEmailAsync(
                    user.Email,
                    user.Name,
                    order.Id,
                    quotePrice,
                    quoteMessage);
                await LogOrderCommunicationAsync(order.Id, "quote_confirmation", "Your quote is ready", user.Email);
                return Ok(new { message = "Quote confirmation email sent." });

            case "order_sent_tracking":
                var trackingCode = string.IsNullOrWhiteSpace(payload.TrackingCode)
                    ? order.TrackingCode
                    : payload.TrackingCode.Trim();
                var trackingUrl = string.IsNullOrWhiteSpace(payload.TrackingUrl)
                    ? order.TrackingUrl
                    : payload.TrackingUrl.Trim();

                if (string.IsNullOrWhiteSpace(trackingCode))
                    return BadRequest(new { message = "Tracking code is required." });

                if (!string.IsNullOrWhiteSpace(payload.TrackingCode) || !string.IsNullOrWhiteSpace(payload.TrackingUrl))
                {
                    order.TrackingCode = trackingCode;
                    order.TrackingUrl = trackingUrl;
                    order.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                await _emailService.SendOrderSentTrackingEmailAsync(
                    user.Email,
                    user.Name,
                    order.Id,
                    trackingCode,
                    trackingUrl);
                await LogOrderCommunicationAsync(order.Id, "order_sent_tracking", "Your order has been sent", user.Email);
                return Ok(new { message = "Order sent email sent." });

            default:
                return BadRequest(new { message = "Unsupported email type." });
        }
    }

    public record QuoteRequest(decimal Price, string Message);
    public record NotesRequest(string? InternalNotes, string? CustomerNotes);
    public record UpdateItemRequest(double Price);
    public record DeliveryPriceRequest(decimal DeliveryPrice);
    public record OrderDiscountRequest(decimal OrderDiscountAmount);
    public record UpdateOrderStatusRequest(string Status);
    public record UpdateOrderCustomerRequest(
        string FullName,
        string AddressLine1,
        string? AddressLine2,
        string City,
        string PostalCode,
        string PhoneNumber);
    public record TrackingRequest(string? TrackingCode, string? TrackingUrl);
    public record SendOrderEmailRequest(string Type, decimal? Price, string? Message, string? TrackingCode, string? TrackingUrl);

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

    private static void DeleteUploadFileIfExists(string? rawUrl)
    {
        if (string.IsNullOrWhiteSpace(rawUrl)) return;

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

        var uploadsRoot = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads"));
        var filePath = Path.GetFullPath(Path.Combine(uploadsRoot, fileName));

        if (!filePath.StartsWith(uploadsRoot + Path.DirectorySeparatorChar, StringComparison.Ordinal))
            return;

        if (System.IO.File.Exists(filePath))
        {
            System.IO.File.Delete(filePath);
        }
    }
}
