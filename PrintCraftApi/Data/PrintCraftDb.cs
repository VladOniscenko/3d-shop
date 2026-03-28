using Microsoft.EntityFrameworkCore;
using PrintCraftApi.Models;

namespace PrintCraftApi.Data;

public class PrintCraftDb : DbContext
{
    public PrintCraftDb(DbContextOptions<PrintCraftDb> options) : base(options) { }

    // These represent the actual tables in your database
    public DbSet<User> Users => Set<User>();
    public DbSet<Filament> Filaments => Set<Filament>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderCommunication> OrderCommunications => Set<OrderCommunication>();
    public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Cart>()
            .HasIndex(c => c.UserId)
            .IsUnique();

        modelBuilder.Entity<ProductImage>()
            .HasOne(pi => pi.Product)
            .WithMany(p => p.Images)
            .HasForeignKey(pi => pi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProductImage>()
            .HasIndex(pi => new { pi.ProductId, pi.SortOrder });

        modelBuilder.Entity<OrderCommunication>()
            .HasIndex(c => new { c.OrderId, c.SentAt });

        modelBuilder.Entity<OrderCommunication>()
            .HasOne<Order>()
            .WithMany(o => o.Communications)
            .HasForeignKey(c => c.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderStatusHistory>()
            .HasIndex(s => new { s.OrderId, s.ChangedAt });

        modelBuilder.Entity<OrderStatusHistory>()
            .HasOne<Order>()
            .WithMany(o => o.StatusHistory)
            .HasForeignKey(s => s.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}