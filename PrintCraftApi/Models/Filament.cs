namespace PrintCraftApi.Models;

public class Filament
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string HexCode { get; set; } = string.Empty;
    public decimal PricePerGram { get; set; }
    public bool InStock { get; set; } = true;
}