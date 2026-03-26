namespace PrintCraftApi.Models;

public class Filament
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Material { get; set; } // Make sure this exists!
    public string Color { get; set; }
    public decimal PricePerGram { get; set; }
    public int StockQuantity { get; set; }
    public string Description { get; set; }
}