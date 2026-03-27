using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PrintCraftApi.Models;

public class CartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }

    [Required]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    public string Material { get; set; } = "PLA";
    public string Color { get; set; } = "Black";
    public int Count { get; set; } = 1;
    public decimal Price { get; set; } = 0; // Price is validated from Product on backend

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [JsonIgnore]
    public Cart Cart { get; set; } = null!;

}
