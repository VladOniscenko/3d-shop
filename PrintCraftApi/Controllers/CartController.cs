using System.Security.Claims;
using System.Text.RegularExpressions;
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
    private const int MaxDistinctCartItems = 50;
    private const int MaxItemCount = 100;
    private const int MaxVariantLength = 40;
    private static readonly Regex VariantRegex = new(@"^[A-Za-z0-9\s\-_.]+$", RegexOptions.Compiled);

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

    private static string NormalizeVariant(string? value, string fallback)
    {
        if (string.IsNullOrWhiteSpace(value)) return fallback;
        return Regex.Replace(value.Trim(), @"\s+", " ");
    }

    private static string? ValidateVariant(string value, string fieldName)
    {
        if (value.Length > MaxVariantLength)
            return $"{fieldName} cannot exceed {MaxVariantLength} characters.";

        if (!VariantRegex.IsMatch(value))
            return $"{fieldName} contains unsupported characters.";

        return null;
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
        if (request.Count <= 0 || request.Count > MaxItemCount)
            return BadRequest(new { message = $"Count must be between 1 and {MaxItemCount}." });

        var product = await _db.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound(new { message = "Product not found" });

        var material = NormalizeVariant(request.Material, "PLA");
        var color = NormalizeVariant(request.Color, "Black");

        var materialError = ValidateVariant(material, "Material");
        if (materialError != null) return BadRequest(new { message = materialError });

        var colorError = ValidateVariant(color, "Color");
        if (colorError != null) return BadRequest(new { message = colorError });

        var cart = await GetOrCreateUserCart();

        if (cart.Items.Count >= MaxDistinctCartItems)
            return BadRequest(new { message = $"Cart can contain at most {MaxDistinctCartItems} items." });

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

        cart.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // Rare race around cart creation/loading; retry adding once on a clean tracker.
            _db.ChangeTracker.Clear();

            cart = await GetOrCreateUserCart();
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
            if (request.Count <= 0 || request.Count > MaxItemCount)
                return BadRequest(new { message = $"Count must be between 1 and {MaxItemCount}." });
            item.Count = request.Count.Value;
        }

        if (!string.IsNullOrWhiteSpace(request.Material))
        {
            var material = NormalizeVariant(request.Material, item.Material);
            var error = ValidateVariant(material, "Material");
            if (error != null) return BadRequest(new { message = error });
            item.Material = material;
        }

        if (!string.IsNullOrWhiteSpace(request.Color))
        {
            var color = NormalizeVariant(request.Color, item.Color);
            var error = ValidateVariant(color, "Color");
            if (error != null) return BadRequest(new { message = error });
            item.Color = color;
        }

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