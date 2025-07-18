using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TripDetailesChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndLocation",
                table: "TripDetails");

            migrationBuilder.DropColumn(
                name: "GPSData",
                table: "TripDetails");

            migrationBuilder.DropColumn(
                name: "StartLocation",
                table: "TripDetails");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EndLocation",
                table: "TripDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GPSData",
                table: "TripDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StartLocation",
                table: "TripDetails",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
