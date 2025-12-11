using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sahaai.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ServiceRequestUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "ServiceRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancelledBy",
                table: "ServiceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "ServiceRequests",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "CancelledBy",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "ServiceRequests");
        }
    }
}
