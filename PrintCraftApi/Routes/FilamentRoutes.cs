using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using System.Security.Claims; // Needed for Role checks

namespace PrintCraftApi.Routes;

public static class FilamentRoutes
{
    public static void MapFilamentRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/filaments");

        // 1. Everyone can see the filaments (Public)
        group.MapGet("/", async (PrintCraftDb db) =>
            await db.Filaments.ToListAsync());

        // 2. Only Admins can add new filaments
        group.MapPost("/", async ([FromBody] Filament filament, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            // Check if the user has the "admin" role claim
            var role = user.FindFirstValue(ClaimTypes.Role);

            if (role != "admin")
            {
                return Results.Forbid(); // Returns 403 Forbidden
            }

            db.Filaments.Add(filament);
            await db.SaveChangesAsync();
            return Results.Created($"/api/filaments/{filament.Id}", filament);
        }).RequireAuthorization(); // Requires a valid JWT to even hit the role check
    }
}