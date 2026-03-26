using System.ComponentModel.DataAnnotations;
public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; } // Links back to the main Order

    [Required] public string FileUrl { get; set; } = string.Empty; // The 3D model path
    public string? fileName { get; set; } // Friendly name (e.g. "Dragon.stl")
    public string? Notes { get; set; }
    public string Material { get; set; } = "PLA"; // Example extra field
    public string Color { get; set; } = "Black"; // Example extra field
    public decimal Price { get; set; } = 0;
}