using System.ComponentModel.DataAnnotations;

namespace PrintCraftApi.Models;

public class QuotePromotionSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public bool IsEnabled { get; set; }
    public bool ShowBannerOnHome { get; set; }

    [MaxLength(500)]
    public string? BannerTextEn { get; set; }

    [MaxLength(500)]
    public string? BannerTextNl { get; set; }

    [MaxLength(50)]
    public string PromotionType { get; set; } = "buy_x_get_y"; // buy_x_get_y | second_item_percent

    public int BuyQuantity { get; set; } = 1;
    public int FreeQuantity { get; set; } = 1;
    public decimal SecondItemPercentOff { get; set; } = 50m;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
