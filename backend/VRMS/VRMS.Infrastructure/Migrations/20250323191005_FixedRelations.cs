using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixedRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Reservations_ReservationId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "PrepaymentAmount",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "TotalPrice",
                table: "Reservations");

            migrationBuilder.AddColumn<string>(
                name: "Photos",
                table: "Vehicles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AlterColumn<string>(
                name: "StripePaymentIntentId",
                table: "Payments",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "StripeClientSecret",
                table: "Payments",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "Buses",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    NumberOfDoors = table.Column<int>(type: "int", nullable: false),
                    HasLuggageCompartment = table.Column<bool>(type: "bit", nullable: false),
                    HasToilet = table.Column<bool>(type: "bit", nullable: false),
                    IsDoubleDecker = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buses", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_Buses_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cars",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    HasAirConditioning = table.Column<bool>(type: "bit", nullable: false),
                    HasNavigationSystem = table.Column<bool>(type: "bit", nullable: false),
                    TrunkCapacity = table.Column<int>(type: "int", nullable: false),
                    HasSunroof = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cars", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_Cars_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Motorcycles",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    HasSideCar = table.Column<bool>(type: "bit", nullable: false),
                    IsElectric = table.Column<bool>(type: "bit", nullable: false),
                    HasABS = table.Column<bool>(type: "bit", nullable: false),
                    MaxSpeed = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Motorcycles", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_Motorcycles_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripDetails",
                columns: table => new
                {
                    TripDetailsId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    DaysTaken = table.Column<int>(type: "int", nullable: false),
                    StartLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EndLocation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DistanceTraveled = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GPSData = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripDetails", x => x.TripDetailsId);
                    table.ForeignKey(
                        name: "FK_TripDetails_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Trucks",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "int", nullable: false),
                    LoadCapacity = table.Column<double>(type: "float", nullable: false),
                    TrailerType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HasSleepingCabin = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trucks", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_Trucks_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations",
                column: "CustomerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TripDetails_VehicleId",
                table: "TripDetails",
                column: "VehicleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Reservations_ReservationId",
                table: "Payments",
                column: "ReservationId",
                principalTable: "Reservations",
                principalColumn: "ReservationId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_Reservations_ReservationId",
                table: "Payments");

            migrationBuilder.DropTable(
                name: "Buses");

            migrationBuilder.DropTable(
                name: "Cars");

            migrationBuilder.DropTable(
                name: "Motorcycles");

            migrationBuilder.DropTable(
                name: "TripDetails");

            migrationBuilder.DropTable(
                name: "Trucks");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Photos",
                table: "Vehicles");

            migrationBuilder.AddColumn<decimal>(
                name: "PrepaymentAmount",
                table: "Reservations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalPrice",
                table: "Reservations",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "StripePaymentIntentId",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)");

            migrationBuilder.AlterColumn<string>(
                name: "StripeClientSecret",
                table: "Payments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_CustomerId",
                table: "Reservations",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_Reservations_ReservationId",
                table: "Payments",
                column: "ReservationId",
                principalTable: "Reservations",
                principalColumn: "ReservationId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
