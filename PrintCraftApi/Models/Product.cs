namespace PrintCraftApi.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ProductType { get; set; } = "print";
    public string Category { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public double Price { get; set; }
    public double DiscountPercentage { get; set; }
    public bool IsActive { get; set; } = true;
    public bool TrackInventory { get; set; }
    public int StockQuantity { get; set; }

    public List<ProductImage> Images { get; set; } = new();
}