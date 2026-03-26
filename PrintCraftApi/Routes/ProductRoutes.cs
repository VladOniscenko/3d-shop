using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Routes;

public static class ProductRoutes
{
    public static void MapProductRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products");

        // GET all products for the gallery
        group.MapGet("/", async (string? category, int? limit, PrintCraftDb db) =>
        {
            var query = db.Products.AsQueryable();

            // 1. Filter by category if one is picked (and it's not "All")
            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(p => p.Category == category);
            }

            // 2. Apply limit (mostly for your "Recent Prints" section)
            if (limit.HasValue)
            {
                query = query.OrderByDescending(p => p.Id).Take(limit.Value);
            }

            return await query.ToListAsync();
        });

        // POST a new product (for admin use)
        group.MapPost("/", async (Product product, PrintCraftDb db) =>
        {
            db.Products.Add(product);
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Id}", product);
        });
    }
}