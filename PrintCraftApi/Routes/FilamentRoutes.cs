using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Routes;

public static class FilamentRoutes
{
    public static void MapFilamentRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/filaments");

        group.MapGet("/", async (PrintCraftDb db) =>
            await db.Filaments.ToListAsync());

        group.MapPost("/", async (Filament filament, PrintCraftDb db) =>
        {
            db.Filaments.Add(filament);
            await db.SaveChangesAsync();
            return Results.Created($"/api/filaments/{filament.Id}", filament);
        });
    }
}