using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using PrintCraftApi.Models;
using PrintCraftApi.Data;

namespace PrintCraftApi.Routes;

public static class OrderRoutes
{
    public static void MapOrderRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").RequireAuthorization();

        // 1. Get ALL orders for the user
        group.MapGet("/", async (ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

            var userId = Guid.Parse(userIdStr);

            var orders = await db.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items) // Loads the List<OrderItem>
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Results.Ok(orders);
        });

        // 2. Get Single Order by ID
        group.MapGet("/{id:guid}", async ([FromRoute] Guid id, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

            var userId = Guid.Parse(userIdStr);

            var order = await db.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            return order is not null ? Results.Ok(order) : Results.NotFound("Order not found or access denied.");
        });

        // 3. Create Order with Multiple Items
        group.MapPost("/quote", async ([FromBody] Order order, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Results.Unauthorized();

            // Setup the main Order
            order.Id = Guid.NewGuid(); // Ensure a fresh ID
            order.UserId = Guid.Parse(userIdStr);
            order.CreatedAt = DateTime.UtcNow;
            order.Status = "pending_quote"; // Force initial status

            // Process each item in the list
            if (order.Items != null)
            {
                foreach (var item in order.Items)
                {
                    item.Id = Guid.NewGuid(); // Give each item its own ID
                    item.OrderId = order.Id;  // Link it to the main Order
                }
            }

            db.Orders.Add(order);
            await db.SaveChangesAsync();

            return Results.Created($"/api/orders/{order.Id}", order);
        });
    }
}