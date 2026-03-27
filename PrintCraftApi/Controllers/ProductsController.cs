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

    public ProductsController(PrintCraftDb db)
    {
        _db = db;
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
}
