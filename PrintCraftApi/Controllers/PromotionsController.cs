using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Data;
using PrintCraftApi.Models;
using PrintCraftApi.Services;

namespace PrintCraftApi.Controllers;

[ApiController]
[Route("api")]
public class PromotionsController : ControllerBase
{
    private readonly PrintCraftDb _db;

    public PromotionsController(PrintCraftDb db)
    {
        _db = db;
    }

    [HttpGet("promotions/quote/active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveQuotePromotion()
    {
        var settings = await GetSettingsAsync();
        if (settings == null || !settings.IsEnabled || !settings.ShowBannerOnHome)
            return Ok(new { isActive = false });

        return Ok(new
        {
            isActive = true,
            promotionType = settings.PromotionType,
            buyQuantity = settings.BuyQuantity,
            freeQuantity = settings.FreeQuantity,
            secondItemPercentOff = settings.SecondItemPercentOff,
            ruleSummary = QuotePromotionCalculator.BuildRuleSummary(settings),
            bannerTextEn = string.IsNullOrWhiteSpace(settings.BannerTextEn)
                ? QuotePromotionCalculator.BuildRuleSummary(settings)
                : settings.BannerTextEn.Trim(),
            bannerTextNl = string.IsNullOrWhiteSpace(settings.BannerTextNl)
                ? QuotePromotionCalculator.BuildRuleSummary(settings)
                : settings.BannerTextNl.Trim(),
        });
    }

    [HttpGet("admin/promotions/quote")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetQuotePromotionSettings()
    {
        var settings = await GetOrCreateSettingsAsync();
        return Ok(ToDto(settings));
    }

    [HttpPut("admin/promotions/quote")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpsertQuotePromotionSettings([FromBody] UpsertQuotePromotionRequest payload)
    {
        var validationError = ValidatePayload(payload);
        if (validationError != null)
            return BadRequest(new { message = validationError });

        var settings = await GetOrCreateSettingsAsync();
        settings.IsEnabled = payload.IsEnabled;
        settings.ShowBannerOnHome = payload.ShowBannerOnHome;
        settings.PromotionType = payload.PromotionType.Trim().ToLowerInvariant();
        settings.BuyQuantity = payload.BuyQuantity;
        settings.FreeQuantity = payload.FreeQuantity;
        settings.SecondItemPercentOff = payload.SecondItemPercentOff;
        settings.BannerTextEn = string.IsNullOrWhiteSpace(payload.BannerTextEn)
            ? null
            : payload.BannerTextEn.Trim();
        settings.BannerTextNl = string.IsNullOrWhiteSpace(payload.BannerTextNl)
            ? null
            : payload.BannerTextNl.Trim();
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(ToDto(settings));
    }

    [HttpPost("admin/promotions/quote/apply/{orderId:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ApplyQuotePromotionToOrder([FromRoute] Guid orderId)
    {
        var settings = await GetSettingsAsync();
        if (settings == null || !settings.IsEnabled)
            return BadRequest(new { message = "Quote promotion is not enabled." });

        var order = await _db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
            return NotFound(new { message = "Order not found" });

        if (!string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Promotion can only be applied to quote orders." });

        var normalizedStatus = (order.Status ?? string.Empty).Trim().ToLowerInvariant();
        if (order.IsPaid || normalizedStatus is "paid" or "printing" or "sent" or "delivered" or "completed")
            return BadRequest(new { message = "Pricing is locked for this order." });

        var discount = QuotePromotionCalculator.CalculateDiscount(order, settings);

        order.OrderDiscountAmount = Math.Max(discount, 0m);
        RecalculateQuotedPrice(order);
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            orderId = order.Id,
            orderDiscountAmount = order.OrderDiscountAmount,
            quotedPrice = order.QuotedPrice,
            ruleSummary = QuotePromotionCalculator.BuildRuleSummary(settings),
        });
    }

    private async Task<QuotePromotionSettings?> GetSettingsAsync()
    {
        return await _db.QuotePromotionSettings
            .OrderByDescending(x => x.UpdatedAt)
            .FirstOrDefaultAsync();
    }

    private async Task<QuotePromotionSettings> GetOrCreateSettingsAsync()
    {
        var settings = await GetSettingsAsync();
        if (settings != null)
            return settings;

        settings = new QuotePromotionSettings
        {
            IsEnabled = false,
            ShowBannerOnHome = false,
            PromotionType = "buy_x_get_y",
            BuyQuantity = 1,
            FreeQuantity = 1,
            SecondItemPercentOff = 50m,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.QuotePromotionSettings.Add(settings);
        await _db.SaveChangesAsync();
        return settings;
    }

    private static string? ValidatePayload(UpsertQuotePromotionRequest payload)
    {
        if (!QuotePromotionCalculator.IsSupportedType(payload.PromotionType))
            return "Unsupported promotion type.";

        var type = payload.PromotionType.Trim().ToLowerInvariant();
        if (type == "buy_x_get_y")
        {
            if (payload.BuyQuantity <= 0)
                return "Buy quantity must be greater than zero.";

            if (payload.FreeQuantity <= 0)
                return "Free quantity must be greater than zero.";
        }

        if (type == "second_item_percent")
        {
            if (payload.SecondItemPercentOff <= 0m || payload.SecondItemPercentOff > 100m)
                return "Second item percent off must be between 0 and 100.";
        }

        return null;
    }

    private static object ToDto(QuotePromotionSettings settings)
    {
        return new
        {
            settings.Id,
            settings.IsEnabled,
            settings.ShowBannerOnHome,
            settings.PromotionType,
            settings.BuyQuantity,
            settings.FreeQuantity,
            settings.SecondItemPercentOff,
            settings.BannerTextEn,
            settings.BannerTextNl,
            settings.UpdatedAt,
            RuleSummary = QuotePromotionCalculator.BuildRuleSummary(settings),
        };
    }

    private static void RecalculateQuotedPrice(Order order)
    {
        var subtotal = order.Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count));
        var normalizedDelivery = Math.Max(order.DeliveryPrice, 0m);
        var normalizedDiscount = Math.Max(order.OrderDiscountAmount, 0m);
        var total = Math.Max(subtotal + normalizedDelivery - normalizedDiscount, 0m);

        order.QuotedPrice = total > 0m ? total : null;
    }

    public record UpsertQuotePromotionRequest(
        bool IsEnabled,
        bool ShowBannerOnHome,
        string PromotionType,
        int BuyQuantity,
        int FreeQuantity,
        decimal SecondItemPercentOff,
        string? BannerTextEn,
        string? BannerTextNl);
}
