using System.ComponentModel.DataAnnotations;
public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }

    [Required] public string FileUrl { get; set; } = string.Empty;
    public string? fileName { get; set; }
    public string? Notes { get; set; }
    public string Material { get; set; } = "PLA";
    public string Color { get; set; } = "Black";
    public int Count { get; set; }
    public decimal Price { get; set; } = 0;
}