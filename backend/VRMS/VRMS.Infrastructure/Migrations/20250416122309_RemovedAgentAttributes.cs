using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VRMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovedAgentAttributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgencyName",
                table: "Agents");

            migrationBuilder.DropColumn(
                name: "Certification",
                table: "Agents");

            migrationBuilder.RenameColumn(
                name: "LicenseNumber",
                table: "Agents",
                newName: "BranchLocation");

            migrationBuilder.AlterColumn<int>(
                name: "WorkExperience",
                table: "Agents",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinedDate",
                table: "Agents",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JoinedDate",
                table: "Agents");

            migrationBuilder.RenameColumn(
                name: "BranchLocation",
                table: "Agents",
                newName: "LicenseNumber");

            migrationBuilder.AlterColumn<string>(
                name: "WorkExperience",
                table: "Agents",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "AgencyName",
                table: "Agents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Certification",
                table: "Agents",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
