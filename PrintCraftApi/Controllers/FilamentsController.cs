using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentsController : ControllerBase
{
    private readonly PrintCraftDb _db;

    public FilamentsController(PrintCraftDb db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var filaments = await _db.Filaments.ToListAsync();
        return Ok(filaments);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] Filament filament)
    {
        if (string.IsNullOrWhiteSpace(filament.Name) || string.IsNullOrWhiteSpace(filament.Material) || string.IsNullOrWhiteSpace(filament.Color))
            return BadRequest(new { message = "Name, material and color are required." });

        if (filament.PricePerGram < 0 || filament.StockQuantity < 0)
            return BadRequest(new { message = "Price and stock cannot be negative." });

        _db.Filaments.Add(filament);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = filament.Id }, filament);
    }
}
