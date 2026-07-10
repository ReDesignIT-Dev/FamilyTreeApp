using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyTreeApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangePersonModelToUseGender : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "People",
                type: "text",
                nullable: false,
                defaultValue: "Male",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "People",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Male");
        }
    }
}
