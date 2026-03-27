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

    // --------------------------------------------------------
    // HELPER METHODS
    // --------------------------------------------------------

    private string GetUserIdFromToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("User ID not found in token");
        return userId;
    }

    private async Task<Cart> GetOrCreateUserCart()
    {
        var userIdGuid = Guid.Parse(GetUserIdFromToken());

        var cart = await _db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userIdGuid);

        if (cart != null)
            return cart;

        // If no cart exists, make one.
        cart = new Cart { UserId = userIdGuid };
        _db.Carts.Add(cart);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // If two requests try to create a cart at the exact same millisecond, 
            // one will fail. We just catch the fail and grab the one that succeeded.
            _db.ChangeTracker.Clear();
            cart = await _db.Carts.Include(c => c.Items).FirstAsync(c => c.UserId == userIdGuid);
        }

        return cart;
    }

    private static object ToCartItemResponse(CartItem item)
    {
        return new
        {
            item.Id,
            item.ProductId,
            item.ProductName,
            item.ImageUrl,
            item.Material,
            item.Color,
            item.Count,
            item.Price,
            item.AddedAt
        };
    }

    private static object ToCartResponse(Cart cart)
    {
        return new
        {
            cart.Id,
            cart.UserId,
            cart.CreatedAt,
            cart.UpdatedAt,
            Items = cart.Items.Select(ToCartItemResponse).ToList()
        };
    }

    // --------------------------------------------------------
    // API ENDPOINTS
    // --------------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetOrCreateUserCart();
        return Ok(ToCartResponse(cart));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
    {
        if (request.ProductId == Guid.Empty) return BadRequest(new { message = "ProductId is required" });
        if (request.Count <= 0) return BadRequest(new { message = "Count must be greater than 0" });

        var product = await _db.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound(new { message = "Product not found" });

        var material = request.Material ?? "PLA";
        var color = request.Color ?? "Black";

        var cart = await GetOrCreateUserCart();

        var existingItem = await _db.CartItems.FirstOrDefaultAsync(i =>
            i.CartId == cart.Id &&
            i.ProductId == request.ProductId &&
            i.Material == material &&
            i.Color == color);

        if (existingItem != null)
        {
            existingItem.Count += request.Count;
        }
        else
        {
            _db.CartItems.Add(new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                ImageUrl = product.ImageUrl,
                Material = material,
                Color = color,
                Count = request.Count,
                Price = (decimal)product.Price
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Rare race: if two requests add the same SKU variant at once, reload and merge once.
            _db.ChangeTracker.Clear();

            cart = await GetOrCreateUserCart();
            existingItem = await _db.CartItems.FirstOrDefaultAsync(i =>
                i.CartId == cart.Id &&
                i.ProductId == request.ProductId &&
                i.Material == material &&
                i.Color == color);

            if (existingItem != null)
            {
                existingItem.Count += request.Count;
            }
            else
            {
                _db.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    ImageUrl = product.ImageUrl,
                    Material = material,
                    Color = color,
                    Count = request.Count,
                    Price = (decimal)product.Price
                });
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        var updatedCart = await _db.Carts
            .Include(c => c.Items)
            .FirstAsync(c => c.Id == cart.Id);

        return Ok(new { message = "Item added to cart", cart = ToCartResponse(updatedCart) });
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem([FromRoute] Guid id, [FromBody] UpdateCartItemRequest request)
    {
        var cart = await GetOrCreateUserCart();

        var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);
        if (item == null) return NotFound(new { message = "Cart item not found" });

        if (request.Count.HasValue)
        {
            if (request.Count <= 0) return BadRequest(new { message = "Count must be greater than 0" });
            item.Count = request.Count.Value;
        }

        if (!string.IsNullOrEmpty(request.Material)) item.Material = request.Material;
        if (!string.IsNullOrEmpty(request.Color)) item.Color = request.Color;

        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Cart item updated", item = ToCartItemResponse(item) });
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> RemoveItem([FromRoute] Guid id)
    {
        var cart = await GetOrCreateUserCart();
        var item = await _db.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.CartId == cart.Id);

        if (item == null) return NotFound(new { message = "Cart item not found" });

        _db.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Item removed from cart" });
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await GetOrCreateUserCart();
        var items = await _db.CartItems.Where(ci => ci.CartId == cart.Id).ToListAsync();

        _db.CartItems.RemoveRange(items);
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