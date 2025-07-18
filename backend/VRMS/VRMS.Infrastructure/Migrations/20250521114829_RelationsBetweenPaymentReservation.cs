using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RelationsBetweenPaymentReservation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments",
                column: "ReservationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments",
                column: "ReservationId",
                unique: true);
        }
    }
}
