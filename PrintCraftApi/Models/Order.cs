namespace PrintCraftApi.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; } // Links to the User who ordered it
    public string Status { get; set; } = "pending_quote";
    public string? FileUrl { get; set; } // Path to their uploaded 3D model
    public string? Notes { get; set; }
    public decimal? TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}