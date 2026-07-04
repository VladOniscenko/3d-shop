using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations;

public partial class AddOrderPaymentFlow : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "PaymentFlow",
            table: "Orders",
            type: "character varying(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "stripe");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "PaymentFlow",
            table: "Orders");
    }
}