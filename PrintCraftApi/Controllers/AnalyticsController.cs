using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly PrintCraftDb _db;

    public AnalyticsController(PrintCraftDb db)
    {
        _db = db;
    }

    [AllowAnonymous]
    [HttpPost("visit")]
    public async Task<IActionResult> TrackVisit([FromBody] TrackVisitRequest? request)
    {
        var eventType = NormalizeEventType(request?.EventType);
        var pagePath = NormalizePagePath(request?.Path);

        var userIdClaim = User?.Identity?.IsAuthenticated == true
            ? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            : null;

        Guid? parsedUserId = null;
        if (!string.IsNullOrWhiteSpace(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
            parsedUserId = userId;

        var visitorSource = ResolveVisitorSource(userIdClaim, Request.Headers["X-Visitor-Id"].FirstOrDefault(), HttpContext);
        var visitorKey = HashValue(visitorSource);

        var duplicateWindowStart = DateTime.UtcNow.AddSeconds(-20);
        var isDuplicate = await _db.VisitEvents
            .AsNoTracking()
            .AnyAsync(v => v.VisitorKey == visitorKey
                && v.PagePath == pagePath
                && v.EventType == eventType
                && v.VisitedAt >= duplicateWindowStart);

        if (isDuplicate)
            return Ok(new { tracked = false });

        var countryCode = Request.Headers["CF-IPCountry"].FirstOrDefault()?.Trim().ToUpperInvariant();
        var city = Request.Headers["CF-IPCity"].FirstOrDefault()?.Trim();

        _db.VisitEvents.Add(new VisitEvent
        {
            UserId = parsedUserId,
            VisitorKey = visitorKey,
            EventType = eventType,
            PagePath = pagePath,
            CountryCode = string.IsNullOrWhiteSpace(countryCode) ? "UN" : countryCode,
            City = string.IsNullOrWhiteSpace(city) ? null : city,
            UserAgent = Request.Headers["User-Agent"].ToString(),
            VisitedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { tracked = true });
    }

    private static string NormalizeEventType(string? eventType)
    {
        var normalized = string.IsNullOrWhiteSpace(eventType)
            ? "pageview"
            : eventType.Trim().ToLowerInvariant();

        return normalized is "pageview" or "heartbeat" ? normalized : "pageview";
    }

    private static string NormalizePagePath(string? path)
    {
        var candidate = string.IsNullOrWhiteSpace(path) ? "/" : path.Trim();

        if (!candidate.StartsWith('/'))
            candidate = "/" + candidate;

        if (candidate.Length > 180)
            candidate = candidate[..180];

        return candidate;
    }

    private static string ResolveVisitorSource(string? userId, string? visitorId, HttpContext context)
    {
        if (!string.IsNullOrWhiteSpace(userId))
            return $"user:{userId}";

        if (!string.IsNullOrWhiteSpace(visitorId))
            return $"anon:{visitorId.Trim()}";

        var forwarded = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        var ip = !string.IsNullOrWhiteSpace(forwarded)
            ? forwarded.Split(',')[0].Trim()
            : context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return $"ip:{ip}";
    }

    private static string HashValue(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }
}

public sealed record TrackVisitRequest(string? Path, string? EventType);
