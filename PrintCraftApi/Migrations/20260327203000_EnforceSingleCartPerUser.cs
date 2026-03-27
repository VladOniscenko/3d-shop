using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using PrintCraftApi.Data;

#nullable disable

namespace PrintCraftApi.Migrations
{
    [DbContext(typeof(PrintCraftDb))]
    [Migration("20260327203000_EnforceSingleCartPerUser")]
    public partial class EnforceSingleCartPerUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE CartItems
                SET CartId = (
                    SELECT c2.Id
                    FROM Carts c2
                    WHERE c2.UserId = (
                        SELECT c3.UserId
                        FROM Carts c3
                        WHERE c3.Id = CartItems.CartId
                    )
                    ORDER BY c2.CreatedAt, c2.Id
                    LIMIT 1
                )
                WHERE CartId IN (
                    SELECT c.Id
                    FROM Carts c
                    WHERE c.Id != (
                        SELECT c2.Id
                        FROM Carts c2
                        WHERE c2.UserId = c.UserId
                        ORDER BY c2.CreatedAt, c2.Id
                        LIMIT 1
                    )
                );
            ");

            migrationBuilder.Sql(@"
                DELETE FROM Carts
                WHERE Id IN (
                    SELECT c.Id
                    FROM Carts c
                    WHERE c.Id != (
                        SELECT c2.Id
                        FROM Carts c2
                        WHERE c2.UserId = c.UserId
                        ORDER BY c2.CreatedAt, c2.Id
                        LIMIT 1
                    )
                );
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId",
                table: "Carts",
                column: "UserId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Carts_UserId",
                table: "Carts");
        }
    }
}
