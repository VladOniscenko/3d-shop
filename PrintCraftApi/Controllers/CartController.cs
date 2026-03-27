using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly PrintCraftDb _db;

    public CartController(PrintCraftDb db)
    {
        _db = db;
    }

    private async Task<Cart> GetOrCreateUserCart()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("User ID not found in token");

        var userIdGuid = Guid.Parse(userId);

        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userIdGuid);

        if (cart == null)
        {
            cart = new Cart { UserId = userIdGuid };
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }

        return cart;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetOrCreateUserCart();
        await _db.Entry(cart).Collection(c => c.Items).LoadAsync();
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
    {
        // Validate request
        if (request.ProductId == Guid.Empty)
            return BadRequest(new { message = "ProductId is required" });
        if (request.Count <= 0)
            return BadRequest(new { message = "Count must be greater than 0" });

        // Fetch product to validate price
        var product = await _db.Products.FindAsync(request.ProductId);
        if (product == null)
            return NotFound(new { message = "Product not found" });

        var cart = await GetOrCreateUserCart();

        // Check if item already exists in cart
        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            // Update count instead of adding duplicate
            existingItem.Count += request.Count;
            existingItem.Material = request.Material ?? existingItem.Material;
            existingItem.Color = request.Color ?? existingItem.Color;
        }
        else
        {
            // Create new cart item with validated price
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ImageUrl = product.ImageUrl,
                Material = request.Material ?? "PLA",
                Color = request.Color ?? "Black",
                Count = request.Count,
                Price = (decimal)product.Price // Validate from database
            };
            cart.Items.Add(cartItem);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Item added to cart", cart });
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem([FromRoute] Guid id, [FromBody] UpdateCartItemRequest request)
    {
        var cart = await GetOrCreateUserCart();
        var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);

        if (item == null)
            return NotFound(new { message = "Cart item not found" });

        if (request.Count.HasValue)
        {
            if (request.Count <= 0)
                return BadRequest(new { message = "Count must be greater than 0" });
            item.Count = request.Count.Value;
        }

        if (!string.IsNullOrEmpty(request.Material))
            item.Material = request.Material;

        if (!string.IsNullOrEmpty(request.Color))
            item.Color = request.Color;

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Cart item updated", item });
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem([FromRoute] Guid id)
    {
        var cart = await GetOrCreateUserCart();
        var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);

        if (item == null)
            return NotFound(new { message = "Cart item not found" });

        _db.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Item removed from cart" });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await GetOrCreateUserCart();
        _db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Cart cleared" });
    }
}

public record AddCartItemRequest(
    Guid ProductId,
    int Count,
    string? Material = null,
    string? Color = null
);

public record UpdateCartItemRequest(
    int? Count = null,
    string? Material = null,
    string? Color = null
);
