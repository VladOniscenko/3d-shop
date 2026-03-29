using PrintCraftApi.Models;

namespace PrintCraftApi.Services;

public static class QuotePromotionCalculator
{
    public static readonly HashSet<string> SupportedPromotionTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "buy_x_get_y",
        "second_item_percent",
    };

    public static bool IsSupportedType(string? promotionType)
        => !string.IsNullOrWhiteSpace(promotionType)
            && SupportedPromotionTypes.Contains(promotionType.Trim());

    public static decimal CalculateDiscount(Order order, QuotePromotionSettings settings)
    {
        if (!settings.IsEnabled) return 0m;
        if (!string.Equals(order.OrderType, "quote", StringComparison.OrdinalIgnoreCase)) return 0m;

        var units = ExpandPricedUnits(order);
        if (units.Count == 0) return 0m;

        var promotionType = (settings.PromotionType ?? string.Empty).Trim().ToLowerInvariant();
        return promotionType switch
        {
            "buy_x_get_y" => CalculateBuyXGetYDiscount(units, settings.BuyQuantity, settings.FreeQuantity),
            "second_item_percent" => CalculateSecondItemPercentDiscount(units, settings.SecondItemPercentOff),
            _ => 0m,
        };
    }

    public static string BuildRuleSummary(QuotePromotionSettings settings)
    {
        var promotionType = (settings.PromotionType ?? string.Empty).Trim().ToLowerInvariant();

        if (promotionType == "buy_x_get_y")
        {
            var buy = Math.Max(settings.BuyQuantity, 1);
            var free = Math.Max(settings.FreeQuantity, 0);
            if (free == 0) return "No free-item discount configured";
            return $"Buy {buy}, get {free} free";
        }

        if (promotionType == "second_item_percent")
        {
            var pct = ClampPercent(settings.SecondItemPercentOff);
            return $"Every second item {pct:0.##}% off";
        }

        return "No promotion rule configured";
    }

    private static List<decimal> ExpandPricedUnits(Order order)
    {
        var units = new List<decimal>();

        foreach (var item in order.Items)
        {
            var qty = item.Count <= 0 ? 1 : item.Count;
            var unitPrice = Math.Max((decimal)item.Price, 0m);

            if (unitPrice <= 0m) continue;

            for (var i = 0; i < qty; i++)
            {
                units.Add(unitPrice);
            }
        }

        return units;
    }

    private static decimal CalculateBuyXGetYDiscount(List<decimal> units, int buyQuantity, int freeQuantity)
    {
        var buy = Math.Max(buyQuantity, 1);
        var free = Math.Max(freeQuantity, 0);
        if (free == 0) return 0m;

        var groupSize = buy + free;
        if (groupSize <= 0) return 0m;

        var groups = units.Count / groupSize;
        var freeCount = groups * free;
        if (freeCount <= 0) return 0m;

        var cheapest = units
            .OrderBy(x => x)
            .Take(freeCount)
            .ToList();

        return cheapest.Sum();
    }

    private static decimal CalculateSecondItemPercentDiscount(List<decimal> units, decimal percent)
    {
        var pct = ClampPercent(percent);
        if (pct <= 0m) return 0m;

        var ordered = units.OrderByDescending(x => x).ToList();
        decimal discount = 0m;

        for (var i = 0; i + 1 < ordered.Count; i += 2)
        {
            var secondInPair = ordered[i + 1];
            discount += secondInPair * (pct / 100m);
        }

        return discount;
    }

    private static decimal ClampPercent(decimal percent)
    {
        if (percent < 0m) return 0m;
        if (percent > 100m) return 100m;
        return percent;
    }
}
