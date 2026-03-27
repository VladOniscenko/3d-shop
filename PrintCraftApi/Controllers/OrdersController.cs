using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using PrintCraftApi.Validation;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IWebHostEnvironment _env;

    public OrdersController(PrintCraftDb db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
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
    public async Task<IActionResult> CreateQuote([FromBody] Order order)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

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
                message = "Please correct shipping info and try again.",
                errors = shippingValidation.Errors
            });
        }

        if (order.Items == null || order.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one model is required for a quote." });
        }

        if (order.Items.Any(i => string.IsNullOrWhiteSpace(i.FileUrl) || i.Count <= 0))
        {
            return BadRequest(new { message = "Each quote item must include a valid file and quantity." });
        }

        if (order.Items.Any(i => i.Count > 100))
        {
            return BadRequest(new { message = "Item quantity cannot exceed 100 per model." });
        }

        order.Id = Guid.NewGuid();
        order.UserId = Guid.Parse(userIdStr);
        order.CreatedAt = DateTime.UtcNow;
        order.Status = "pending_quote";
        order.OrderType = "quote";
        order.IsPaid = false;
        order.QuotedPrice = null;
        order.QuoteMessage = null;
        order.FullName = shippingValidation.FullName;
        order.PhoneNumber = shippingValidation.PhoneNumber;
        order.AddressLine1 = shippingValidation.AddressLine1;
        order.City = shippingValidation.City;
        order.PostalCode = shippingValidation.PostalCode;

        if (order.Items != null)
        {
            foreach (var item in order.Items)
            {
                item.Id = Guid.NewGuid();
                item.OrderId = order.Id;
                item.Price = 0;
            }
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
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
            return BadRequest(new { message = "Only pending orders can be deleted." });

        foreach (var item in order.Items)
        {
            if (!string.IsNullOrEmpty(item.FileUrl))
            {
                try
                {
                    var normalizedPath = item.FileUrl.Replace('\\', '/');
                    var uploadsIndex = normalizedPath.IndexOf("/uploads/", StringComparison.OrdinalIgnoreCase);

                    string filePath;
                    if (uploadsIndex >= 0)
                    {
                        var relativeUploadPath = normalizedPath[(uploadsIndex + 1)..]; // "uploads/<file>"
                        filePath = Path.Combine(_env.WebRootPath, relativeUploadPath.Replace('/', Path.DirectorySeparatorChar));
                    }
                    else
                    {
                        var fileName = Path.GetFileName(normalizedPath);
                        filePath = Path.Combine(_env.WebRootPath, "uploads", fileName);
                    }

                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to delete file: {ex.Message}");
                }
            }
        }

        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Project removed and files deleted.", orderId = id });
    }
}
