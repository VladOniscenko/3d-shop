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
    public DbSet<Order> Orders => Set<Order>();
}