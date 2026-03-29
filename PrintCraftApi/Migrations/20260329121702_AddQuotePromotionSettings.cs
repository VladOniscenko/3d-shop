using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotePromotionSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuotePromotionSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ShowBannerOnHome = table.Column<bool>(type: "boolean", nullable: false),
                    BannerTextEn = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BannerTextNl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PromotionType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "buy_x_get_y"),
                    BuyQuantity = table.Column<int>(type: "integer", nullable: false),
                    FreeQuantity = table.Column<int>(type: "integer", nullable: false),
                    SecondItemPercentOff = table.Column<decimal>(type: "numeric", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotePromotionSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuotePromotionSettings_UpdatedAt",
                table: "QuotePromotionSettings",
                column: "UpdatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuotePromotionSettings");
        }
    }
}
