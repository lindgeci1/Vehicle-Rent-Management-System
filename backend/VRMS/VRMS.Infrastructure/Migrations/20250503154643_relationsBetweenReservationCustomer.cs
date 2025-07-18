using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class relationsBetweenReservationCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations",
                column: "CustomerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations",
                column: "CustomerId",
                unique: true);
        }
    }
}
