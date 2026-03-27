using System.ComponentModel.DataAnnotations;

namespace PrintCraftApi.Models;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; }

    // Shipping Address
    [Required] public string FullName { get; set; } = string.Empty;
    [Required] public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    [Required] public string City { get; set; } = string.Empty;
    [Required] public string PostalCode { get; set; } = string.Empty;
    [Required] public string PhoneNumber { get; set; } = string.Empty;

    public string Status { get; set; } = "pending_quote";
    public decimal DeliveryPrice { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // The list of items in this order
    public List<OrderItem> Items { get; set; } = new();
}