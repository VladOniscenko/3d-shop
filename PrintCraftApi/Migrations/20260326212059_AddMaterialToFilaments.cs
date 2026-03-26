using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCraftApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMaterialToFilaments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InStock",
                table: "Filaments",
                newName: "StockQuantity");

            migrationBuilder.RenameColumn(
                name: "HexCode",
                table: "Filaments",
                newName: "Material");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Filaments",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Filaments");

            migrationBuilder.RenameColumn(
                name: "StockQuantity",
                table: "Filaments",
                newName: "InStock");

            migrationBuilder.RenameColumn(
                name: "Material",
                table: "Filaments",
                newName: "HexCode");
        }
    }
}
