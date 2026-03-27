using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly PrintCraftDb _db;
    private readonly IWebHostEnvironment _env;

    public ProductsController(PrintCraftDb db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] int? limit)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrEmpty(category) && category != "All")
        {
            query = query.Where(p => p.Category == category);
        }

        if (limit.HasValue)
        {
            query = query.OrderByDescending(p => p.Id).Take(limit.Value);
        }

        var products = await query.ToListAsync();
        return Ok(products);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "admin")
            return Forbid();

        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] Product update)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "admin")
            return Forbid();

        var existing = await _db.Products.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = update.Name;
        existing.Category = update.Category;
        existing.ImageUrl = update.ImageUrl;
        existing.FileUrl = update.FileUrl;
        existing.Price = update.Price;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "admin")
            return Forbid();

        var existing = await _db.Products.FindAsync(id);
        if (existing == null) return NotFound();

        // Delete associated files
        if (!string.IsNullOrEmpty(existing.ImageUrl))
        {
            var imagePath = Path.Combine(_env.WebRootPath, existing.ImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }
        }
        if (!string.IsNullOrEmpty(existing.FileUrl))
        {
            var filePath = Path.Combine(_env.WebRootPath, existing.FileUrl.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _db.Products.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
