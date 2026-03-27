using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations
{
    public partial class AddAdminOrderFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OrderType",
                table: "Orders",
                type: "TEXT",
                nullable: false,
                defaultValue: "quote");

            migrationBuilder.AddColumn<decimal>(
                name: "QuotedPrice",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuoteMessage",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalNotes",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerNotes",
                table: "Orders",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Orders",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Orders",
                type: "TEXT",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "QuotedPrice", table: "Orders");
            migrationBuilder.DropColumn(name: "QuoteMessage", table: "Orders");
            migrationBuilder.DropColumn(name: "InternalNotes", table: "Orders");
            migrationBuilder.DropColumn(name: "CustomerNotes", table: "Orders");
            migrationBuilder.DropColumn(name: "IsPaid", table: "Orders");
            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Orders");
        }
    }
}
