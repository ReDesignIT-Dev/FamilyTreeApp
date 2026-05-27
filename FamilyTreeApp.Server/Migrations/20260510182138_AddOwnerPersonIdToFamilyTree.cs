using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyTreeApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOwnerPersonIdToFamilyTree : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OwnerPersonId",
                table: "FamilyTrees",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyTrees_OwnerPersonId",
                table: "FamilyTrees",
                column: "OwnerPersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyTrees_People_OwnerPersonId",
                table: "FamilyTrees",
                column: "OwnerPersonId",
                principalTable: "People",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyTrees_People_OwnerPersonId",
                table: "FamilyTrees");

            migrationBuilder.DropIndex(
                name: "IX_FamilyTrees_OwnerPersonId",
                table: "FamilyTrees");

            migrationBuilder.DropColumn(
                name: "OwnerPersonId",
                table: "FamilyTrees");
        }
    }
}
