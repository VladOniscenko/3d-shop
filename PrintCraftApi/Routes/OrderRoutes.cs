using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Routes;

public static class OrderRoutes
{
    public static void MapOrderRoutes(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders").RequireAuthorization();

        // 1. Get ALL orders
        group.MapGet("/", async (ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();

            var userGuid = Guid.Parse(userIdClaim);
            var orders = await db.Orders.Where(o => o.UserId == userGuid).ToListAsync();
            return Results.Ok(orders);
        });

        // 2. Get SINGLE order (This is usually where CS1593 hits)
        group.MapGet("/{id:guid}", async ([FromRoute] Guid id, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim)) return Results.Unauthorized();

            var userGuid = Guid.Parse(userIdClaim);
            var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userGuid);

            return order is not null ? Results.Ok(order) : Results.NotFound();
        });

        // 3. Create a new order
        group.MapPost("/quote", async ([FromBody] Order order, ClaimsPrincipal user, [FromServices] PrintCraftDb db) =>
        {
            var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                order.UserId = Guid.Parse(userIdClaim);
            }

            db.Orders.Add(order);
            await db.SaveChangesAsync();
            return Results.Created($"/api/orders/{order.Id}", order);
        });
    }
}