using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using System.Security.Claims; // Needed for Role checks

namespace PrintCraftApi.Routes;

public static class ProductRoutes
{
    public static void MapProductRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products");

        // 1. PUBLIC: Anyone can see the gallery
        group.MapGet("/", async (string? category, int? limit, [FromServices] PrintCraftDb db) =>
        {
            var query = db.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(p => p.Category == category);
            }

            if (limit.HasValue)
            {
                // Order by newest first if a limit is set (for the "Recent Prints" section)
                query = query.OrderByDescending(p => p.Id).Take(limit.Value);
            }

            return await query.ToListAsync();
        });

        // 2. ADMIN ONLY: Only authorized admins can post new items
        group.MapPost("/", async ([FromBody] Product product, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            // Check the role claim in the JWT token
            var role = user.FindFirstValue(ClaimTypes.Role);

            if (role != "admin")
            {
                return Results.Forbid(); // Returns 403 Forbidden
            }

            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Id}", product);
        }).RequireAuthorization(); // Ensures the user is logged in
    }
}