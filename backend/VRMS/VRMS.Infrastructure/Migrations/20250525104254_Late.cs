using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Late : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLate",
                table: "Reservations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "LateDays",
                table: "Reservations",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLate",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "LateDays",
                table: "Reservations");
        }
    }
}
