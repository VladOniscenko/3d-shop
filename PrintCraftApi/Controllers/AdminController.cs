using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using System.IO;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    [HttpPut("orders/{id:guid}/paid")]
    public async Task<IActionResult> MarkPaid([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.Status = "paid";
        order.IsPaid = true;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }
    private readonly PrintCraftDb _db;

    public AdminController(PrintCraftDb db)
    {
        _db = db;
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

    [HttpPut("orders/{id:guid}")]
    public async Task<IActionResult> UpdateOrder([FromRoute] Guid id, [FromBody] Order updated)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null)
            return NotFound(new { message = "Order not found" });

        order.FullName = updated.FullName;
        order.AddressLine1 = updated.AddressLine1;
        order.AddressLine2 = updated.AddressLine2;
        order.City = updated.City;
        order.PostalCode = updated.PostalCode;
        order.PhoneNumber = updated.PhoneNumber;
        order.Status = updated.Status;
        order.DeliveryPrice = updated.DeliveryPrice;
        order.QuotedPrice = updated.QuotedPrice;
        order.QuoteMessage = updated.QuoteMessage;
        order.InternalNotes = updated.InternalNotes;
        order.CustomerNotes = updated.CustomerNotes;
        order.IsPaid = updated.IsPaid;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/quote")]
    public async Task<IActionResult> DoQuote([FromRoute] Guid id, [FromBody] QuoteRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.QuotedPrice = payload.Price;
        order.QuoteMessage = payload.Message;
        order.Status = "quoted";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/confirm")]
    public async Task<IActionResult> ConfirmOrder([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        if (order.Status == "cancelled" || order.Status == "completed")
            return BadRequest(new { message = "Cannot confirm this order." });

        order.Status = "printing";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/sent")]
    public async Task<IActionResult> MarkSent([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.Status = "sent";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPut("orders/{id:guid}/delivered")]
    public async Task<IActionResult> MarkDelivered([FromRoute] Guid id)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.Status = "delivered";
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpDelete("orders/{id:guid}")]
    public async Task<IActionResult> DeleteOrder([FromRoute] Guid id)
    {
        var order = await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        // Delete associated files
        foreach (var item in order.Items)
        {
            if (!string.IsNullOrEmpty(item.FileUrl))
            {
                var filePath = Path.Combine("wwwroot", item.FileUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
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

        var item = order.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) return NotFound(new { message = "Item not found" });

        item.Price = payload.Price;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(order);
    }

    [HttpPatch("orders/{id:guid}/delivery-price")] // PATCH for partial update
    public async Task<IActionResult> UpdateDeliveryPrice([FromRoute] Guid id, [FromBody] DeliveryPriceRequest payload)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound(new { message = "Order not found" });

        order.DeliveryPrice = payload.DeliveryPrice;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(order);
    }

    public record QuoteRequest(decimal Price, string Message);
    public record NotesRequest(string? InternalNotes, string? CustomerNotes);
    public record UpdateItemRequest(double Price);
    public record DeliveryPriceRequest(decimal DeliveryPrice);
}
