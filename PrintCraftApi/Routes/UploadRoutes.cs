using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PrintCraftApi.Routes;

public static class UploadRoutes
{
    public static void MapUploadRoutes(this IEndpointRouteBuilder app)
    {
        // RequireAuthorization() ensures only logged-in users can upload models
        app.MapPost("/api/upload", async (IFormFile file, ClaimsPrincipal user) =>
        {
            // 1. Basic validation
            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded.");

            // 2. Setup the folder
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 3. Make the filename unique and safe
            // We use a Guid so two users can upload "benchie.stl" without issues
            var safeFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, safeFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            // 4. Return the path so the frontend can save it to the Order record
            return Results.Ok(new { url = $"/uploads/{safeFileName}" });
        })
        .RequireAuthorization()
        .DisableAntiforgery();
    }
}