namespace PrintCraftApi.Routes;

public static class UploadRoutes
{
    public static void MapUploadRoutes(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/upload", async (IFormFile file) =>
        {
            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var safeFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, safeFileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return Results.Ok(new { url = $"/uploads/{safeFileName}" });
        }).DisableAntiforgery();
    }
}