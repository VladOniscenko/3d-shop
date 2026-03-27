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
    public sealed class UpdateFilamentRequest
    {
        public decimal PricePerGram { get; set; }
        public int StockQuantity { get; set; }
    }

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

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFilamentRequest request)
    {
        if (request.PricePerGram < 0 || request.StockQuantity < 0)
            return BadRequest(new { message = "Price and stock cannot be negative." });

        var filament = await _db.Filaments.FirstOrDefaultAsync(f => f.Id == id);
        if (filament is null)
            return NotFound(new { message = "Filament not found." });

        filament.PricePerGram = request.PricePerGram;
        filament.StockQuantity = request.StockQuantity;

        await _db.SaveChangesAsync();
        return Ok(filament);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var filament = await _db.Filaments.FirstOrDefaultAsync(f => f.Id == id);
        if (filament is null)
            return NotFound(new { message = "Filament not found." });

        _db.Filaments.Remove(filament);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
