namespace PrintCraftApi.Services;

public static class ProductPricing
{
    public const double MinDiscountPercentage = 0;
    public const double MaxDiscountPercentage = 90;

    public static double ClampDiscount(double discountPercentage)
    {
        if (discountPercentage < MinDiscountPercentage) return MinDiscountPercentage;
        if (discountPercentage > MaxDiscountPercentage) return MaxDiscountPercentage;
        return discountPercentage;
    }

    public static decimal EffectivePrice(double basePrice, double discountPercentage)
    {
        var safeBasePrice = Math.Max(0d, basePrice);
        var normalizedDiscount = ClampDiscount(discountPercentage);
        var discountedPrice = safeBasePrice * (1d - normalizedDiscount / 100d);
        return decimal.Round((decimal)discountedPrice, 2, MidpointRounding.AwayFromZero);
    }
}
