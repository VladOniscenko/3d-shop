using System.Security.Claims;
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
    [Authorize]
    public async Task<IActionResult> Create([FromBody] Filament filament)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "admin")
            return Forbid();

        _db.Filaments.Add(filament);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = filament.Id }, filament);
    }
}
