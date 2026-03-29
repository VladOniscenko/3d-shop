using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    public string OrderType { get; set; } = "quote"; // "quote" or "online"
    public decimal DeliveryPrice { get; set; } = 6.95m;
    public decimal OrderDiscountAmount { get; set; } = 0m;
    public decimal? QuotedPrice { get; set; }
    public string? QuoteMessage { get; set; }
    public string? TrackingCode { get; set; }
    public string? TrackingUrl { get; set; }
    public string? InternalNotes { get; set; }
    public string? CustomerNotes { get; set; }
    public bool IsPaid { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // The list of items in this order
    public List<OrderItem> Items { get; set; } = new();
    public List<Payment> Payments { get; set; } = new();
    public List<OrderCommunication> Communications { get; set; } = new();
    public List<OrderStatusHistory> StatusHistory { get; set; } = new();

    [NotMapped]
    public decimal SubtotalAmount
        => Items.Sum(i => (decimal)i.Price * (i.Count <= 0 ? 1 : i.Count));

    [NotMapped]
    public decimal DiscountAmount
        => Math.Max(OrderDiscountAmount, 0m);

    [NotMapped]
    public decimal FinalTotalAmount
        => Math.Max(SubtotalAmount + Math.Max(DeliveryPrice, 0m) - DiscountAmount, 0m);
}