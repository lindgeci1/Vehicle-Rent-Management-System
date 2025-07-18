using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedDateOfBith : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Customers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Customers",
                type: "datetime2",
                nullable: true);
        }
    }
}
