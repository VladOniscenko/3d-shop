using System.ComponentModel.DataAnnotations;

namespace PrintCraftApi.Models;

public class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public List<CartItem> Items { get; set; } = new();
}
