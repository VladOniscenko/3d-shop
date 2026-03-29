using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations
{
    /// <inheritdoc />
    public partial class AddVisitAnalytics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VisitEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    VisitorKey = table.Column<string>(type: "text", nullable: false),
                    PagePath = table.Column<string>(type: "text", nullable: false),
                    CountryCode = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    VisitedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VisitEvents_CountryCode_VisitedAt",
                table: "VisitEvents",
                columns: new[] { "CountryCode", "VisitedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_VisitEvents_VisitedAt",
                table: "VisitEvents",
                column: "VisitedAt");

            migrationBuilder.CreateIndex(
                name: "IX_VisitEvents_VisitorKey_VisitedAt",
                table: "VisitEvents",
                columns: new[] { "VisitorKey", "VisitedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VisitEvents");
        }
    }
}
