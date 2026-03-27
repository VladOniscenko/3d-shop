using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations
{
    /// <inheritdoc />
    public partial class RmTotalPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalPrice",
                table: "Orders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TotalPrice",
                table: "Orders",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
