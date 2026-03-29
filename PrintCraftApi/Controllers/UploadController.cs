using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using System.Text;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly PrintCraftDb _db;

    private const long MaxUploadBytes = 50 * 1024 * 1024; // 50 MB
    private const int HeaderReadSize = 512;
    private static readonly HashSet<string> ModelExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".stl", ".obj", ".3mf", ".step", ".stp"
    };

    private static readonly HashSet<string> DoneOrderStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "completed", "delivered", "cancelled", "failed"
    };

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".stl", ".obj", ".3mf", ".step", ".stp",
        ".png", ".jpg", ".jpeg", ".webp", ".gif"
    };

    private static readonly Dictionary<string, HashSet<string>> AllowedContentTypesByExtension =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".png"] = new(StringComparer.OrdinalIgnoreCase) { "image/png" },
            [".jpg"] = new(StringComparer.OrdinalIgnoreCase) { "image/jpeg" },
            [".jpeg"] = new(StringComparer.OrdinalIgnoreCase) { "image/jpeg" },
            [".gif"] = new(StringComparer.OrdinalIgnoreCase) { "image/gif" },
            [".webp"] = new(StringComparer.OrdinalIgnoreCase) { "image/webp" },
            [".3mf"] = new(StringComparer.OrdinalIgnoreCase)
            {
                "model/3mf",
                "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
                "application/zip",
                "application/octet-stream",
            },
            [".stl"] = new(StringComparer.OrdinalIgnoreCase)
            {
                "model/stl",
                "application/sla",
                "application/vnd.ms-pki.stl",
                "application/octet-stream",
                "text/plain",
            },
            [".obj"] = new(StringComparer.OrdinalIgnoreCase)
            {
                "model/obj",
                "text/plain",
                "application/octet-stream",
            },
            [".step"] = new(StringComparer.OrdinalIgnoreCase)
            {
                "model/step",
                "application/step",
                "text/plain",
                "application/octet-stream",
            },
            [".stp"] = new(StringComparer.OrdinalIgnoreCase)
            {
                "model/step",
                "application/step",
                "text/plain",
                "application/octet-stream",
            },
        };

    public UploadController(PrintCraftDb db)
    {
        _db = db;
    }

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

        if (!IsAllowedContentType(extension, file.ContentType))
            return BadRequest(new { message = "Unsupported content type for this file extension." });

        var header = await ReadHeaderAsync(file, HeaderReadSize);
        if (LooksLikeExecutable(header))
            return BadRequest(new { message = "Executable files are not allowed." });

        if (!PassesSignatureValidation(extension, header))
            return BadRequest(new { message = "File content does not match the selected file type." });

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

    [HttpGet("models")]
    [Authorize(Roles = "admin")]
    [EnableRateLimiting("AuthBurst")]
    public IActionResult GetUploadedModels()
    {
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
            return Ok(Array.Empty<object>());

        var productFileNames = _db.Products
            .AsNoTracking()
            .Select(p => p.FileUrl)
            .AsEnumerable()
            .Select(ExtractFileNameFromAssetUrl)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Cast<string>()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var activeOrderFileNames = _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsEnumerable()
            .Where(order => !IsOrderDone(order.Status))
            .SelectMany(order => order.Items
                .Select(item => ExtractFileNameFromAssetUrl(item.FileUrl)))
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Cast<string>()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var orderLinksByFileName = _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .AsEnumerable()
            .SelectMany(order => order.Items
                .Select((item, index) => new
                {
                    orderId = order.Id,
                    itemIndex = index,
                    fileName = ExtractFileNameFromAssetUrl(item.FileUrl),
                }))
            .Where(x => !string.IsNullOrWhiteSpace(x.fileName))
            .GroupBy(x => x.fileName!, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(
                g => g.Key,
                g => g.First(),
                StringComparer.OrdinalIgnoreCase);

        var files = Directory
            .EnumerateFiles(uploadsFolder)
            .Select(path => new FileInfo(path))
            .Where(info => ModelExtensions.Contains(info.Extension))
            .OrderByDescending(info => info.LastWriteTimeUtc)
            .Select(info =>
            {
                orderLinksByFileName.TryGetValue(info.Name, out var link);
                var linkedToProduct = productFileNames.Contains(info.Name);
                var linkedToActiveOrder = activeOrderFileNames.Contains(info.Name);

                return new
                {
                    fileName = info.Name,
                    extension = info.Extension.ToLowerInvariant(),
                    sizeBytes = info.Length,
                    lastModifiedUtc = info.LastWriteTimeUtc,
                    url = $"/uploads/{info.Name}",
                    orderId = link?.orderId,
                    itemIndex = link?.itemIndex,
                    linkedToProduct,
                    linkedToActiveOrder,
                    canDelete = !linkedToProduct && !linkedToActiveOrder,
                };
            })
            .ToArray();

        return Ok(files);
    }

    [HttpDelete("models")]
    [Authorize(Roles = "admin")]
    [EnableRateLimiting("AuthBurst")]
    public IActionResult DeleteUploadedModel([FromQuery] string? fileName)
    {
        var trimmed = (fileName ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
            return BadRequest(new { message = "File name is required." });

        var normalizedFileName = Path.GetFileName(trimmed);
        if (!string.Equals(normalizedFileName, trimmed, StringComparison.Ordinal))
            return BadRequest(new { message = "Invalid file name." });

        var extension = Path.GetExtension(normalizedFileName);
        if (string.IsNullOrWhiteSpace(extension) || !ModelExtensions.Contains(extension))
            return BadRequest(new { message = "Only model files can be deleted from this endpoint." });

        var linkedToProduct = _db.Products
            .AsNoTracking()
            .Select(p => p.FileUrl)
            .AsEnumerable()
            .Any(url => string.Equals(
                ExtractFileNameFromAssetUrl(url),
                normalizedFileName,
                StringComparison.OrdinalIgnoreCase));

        if (linkedToProduct)
            return Conflict(new { message = "File is linked to a product and cannot be deleted." });

        var linkedToActiveOrder = _db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsEnumerable()
            .Where(order => !IsOrderDone(order.Status))
            .SelectMany(order => order.Items)
            .Any(item => string.Equals(
                ExtractFileNameFromAssetUrl(item.FileUrl),
                normalizedFileName,
                StringComparison.OrdinalIgnoreCase));

        if (linkedToActiveOrder)
            return Conflict(new { message = "File is linked to an order that is not completed yet." });

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        var filePath = Path.Combine(uploadsFolder, normalizedFileName);

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File not found." });

        System.IO.File.Delete(filePath);
        return Ok(new { message = "File deleted." });
    }

    private static string? ExtractFileNameFromAssetUrl(string? rawUrl)
    {
        if (string.IsNullOrWhiteSpace(rawUrl)) return null;

        var normalized = rawUrl.Replace('\\', '/').Trim();
        var withoutQuery = normalized.Split('?', 2)[0];
        if (string.IsNullOrWhiteSpace(withoutQuery)) return null;

        return Path.GetFileName(withoutQuery);
    }

    private static bool IsOrderDone(string? status)
    {
        if (string.IsNullOrWhiteSpace(status)) return false;
        return DoneOrderStatuses.Contains(status.Trim());
    }

    private static bool IsAllowedContentType(string extension, string? contentType)
    {
        if (!AllowedContentTypesByExtension.TryGetValue(extension, out var allowedContentTypes))
            return false;

        var normalized = (contentType ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(normalized))
            return true;

        var withoutCharset = normalized.Split(';', 2, StringSplitOptions.TrimEntries)[0];
        return allowedContentTypes.Contains(withoutCharset);
    }

    private static async Task<byte[]> ReadHeaderAsync(IFormFile file, int count)
    {
        await using var stream = file.OpenReadStream();
        var buffer = new byte[count];
        var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, count));
        return buffer[..bytesRead];
    }

    private static bool PassesSignatureValidation(string extension, byte[] header)
    {
        if (header.Length == 0) return false;

        return extension.ToLowerInvariant() switch
        {
            ".png" => HasPrefix(header, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A),
            ".jpg" or ".jpeg" => HasPrefix(header, 0xFF, 0xD8, 0xFF),
            ".gif" => StartsWithAscii(header, "GIF87a") || StartsWithAscii(header, "GIF89a"),
            ".webp" => StartsWithAscii(header, "RIFF") && HasAsciiAt(header, "WEBP", 8),
            ".3mf" => HasPrefix(header, 0x50, 0x4B, 0x03, 0x04),
            ".stl" => IsLikelyStl(header),
            ".obj" => IsLikelyObj(header),
            ".step" or ".stp" => IsLikelyStep(header),
            _ => false,
        };
    }

    private static bool LooksLikeExecutable(byte[] header)
    {
        if (HasPrefix(header, 0x4D, 0x5A)) return true; // PE/EXE
        if (HasPrefix(header, 0x7F, 0x45, 0x4C, 0x46)) return true; // ELF

        // Mach-O (32/64-bit and universal)
        if (HasPrefix(header, 0xFE, 0xED, 0xFA, 0xCE)
            || HasPrefix(header, 0xFE, 0xED, 0xFA, 0xCF)
            || HasPrefix(header, 0xCE, 0xFA, 0xED, 0xFE)
            || HasPrefix(header, 0xCF, 0xFA, 0xED, 0xFE)
            || HasPrefix(header, 0xCA, 0xFE, 0xBA, 0xBE))
        {
            return true;
        }

        return false;
    }

    private static bool IsLikelyStl(byte[] header)
    {
        var ascii = Encoding.ASCII.GetString(header).TrimStart('\u0000', ' ', '\t', '\r', '\n');
        if (ascii.StartsWith("solid", StringComparison.OrdinalIgnoreCase))
            return true;

        // Binary STL has 80-byte header + 4-byte triangle count at minimum.
        return header.Length >= 84;
    }

    private static bool IsLikelyObj(byte[] header)
    {
        var ascii = Encoding.ASCII.GetString(header);
        var trimmed = ascii.TrimStart('\u0000', ' ', '\t', '\r', '\n');

        return trimmed.StartsWith("#", StringComparison.Ordinal)
            || trimmed.StartsWith("v ", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("o ", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("g ", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("f ", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("mtllib ", StringComparison.OrdinalIgnoreCase)
            || trimmed.StartsWith("usemtl ", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsLikelyStep(byte[] header)
    {
        var ascii = Encoding.ASCII.GetString(header);
        return ascii.IndexOf("ISO-10303-21", StringComparison.OrdinalIgnoreCase) >= 0;
    }

    private static bool HasPrefix(byte[] data, params byte[] prefix)
    {
        if (data.Length < prefix.Length) return false;
        for (var i = 0; i < prefix.Length; i++)
        {
            if (data[i] != prefix[i]) return false;
        }

        return true;
    }

    private static bool StartsWithAscii(byte[] data, string value)
    {
        if (data.Length < value.Length) return false;
        var expected = Encoding.ASCII.GetBytes(value);
        for (var i = 0; i < expected.Length; i++)
        {
            if (data[i] != expected[i]) return false;
        }

        return true;
    }

    private static bool HasAsciiAt(byte[] data, string value, int offset)
    {
        if (offset < 0) return false;
        if (data.Length < offset + value.Length) return false;

        var expected = Encoding.ASCII.GetBytes(value);
        for (var i = 0; i < expected.Length; i++)
        {
            if (data[offset + i] != expected[i]) return false;
        }

        return true;
    }
}
