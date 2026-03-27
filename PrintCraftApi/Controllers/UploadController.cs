using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private const long MaxUploadBytes = 50 * 1024 * 1024; // 50 MB
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".stl", ".obj", ".3mf", ".step", ".stp"
    };

    [HttpPost]
    [DisableRequestSizeLimit]
    [EnableRateLimiting("UploadLimit")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > MaxUploadBytes)
            return BadRequest(new { message = "File is too large. Maximum size is 50 MB." });

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
            return BadRequest(new { message = "Unsupported file type." });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var safeFileName = Guid.NewGuid().ToString() + extension.ToLowerInvariant();
        var filePath = Path.Combine(uploadsFolder, safeFileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return Ok(new { url = $"/uploads/{safeFileName}" });
    }
}
