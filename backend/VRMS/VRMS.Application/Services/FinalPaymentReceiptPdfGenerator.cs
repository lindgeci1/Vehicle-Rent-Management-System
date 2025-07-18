using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Services
{
    public static class FinalPaymentReceiptPdfGenerator
    {
        /// <summary>
        /// Generates a PDF for the final payment:
        ///  - Shows “existing damage” (what was already on the vehicle at pre‐condition)
        ///  - Shows “new (extra) damage” (what was added at post‐condition)
        ///  - Includes each category’s description
        ///  - Insurance coverage & final liability
        ///  - Trip cost breakdown & total
        ///  - Amount paid
        ///
        /// Signature now takes 19 parameters:
        ///   1. Receipt receipt
        ///   2. Customer customer
        ///   3. Vehicle vehicle
        ///   4. double existingScratchCost
        ///   5. string existingScratchDescription
        ///   6. double existingDentCost
        ///   7. string existingDentDescription
        ///   8. double existingRustCost
        ///   9. string existingRustDescription
        ///   10. double newScratchCost
        ///   11. string newScratchDescription
        ///   12. double newDentCost
        ///   13. string newDentDescription
        ///   14. double newRustCost
        ///   15. string newRustDescription
        ///   16. double insuranceCoveragePct
        ///   17. decimal totalTripCost
        ///   18. DateTime reservationStartDate
        ///   19. DateTime reservationEndDate
        ///   20. decimal costPerDay
        /// </summary>
        public static byte[] Generate(
            Receipt receipt,
            Customer customer,
            Vehicle vehicle,
            double existingScratchCost,
            string existingScratchDescription,
            double existingDentCost,
            string existingDentDescription,
            double existingRustCost,
            string existingRustDescription,
            double newScratchCost,
            string newScratchDescription,
            double newDentCost,
            string newDentDescription,
            double newRustCost,
            string newRustDescription,
            double insuranceCoveragePct,
            decimal totalTripCost,
            DateTime reservationStartDate,
            DateTime reservationEndDate,
            decimal costPerDay)
        {
            // 1) Calculate number of days
            int rawDays = (reservationEndDate.Date - reservationStartDate.Date).Days;
            int numberOfDays = Math.Max(1, rawDays);

            // 2) Compute totals
            double totalExistingDamage = existingScratchCost + existingDentCost + existingRustCost;
            double totalNewDamage = newScratchCost + newDentCost + newRustCost;
            double totalDamage = totalExistingDamage + totalNewDamage;

            // 3) Final liability after insurance (applies only to new damage)
            double finalLiability = totalNewDamage * (1 - insuranceCoveragePct / 100.0);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Times New Roman"));

                    // ----------------------------------------
                    // Header
                    // ----------------------------------------
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("QuickRent Auto")
                               .FontSize(18).Bold().FontColor(Colors.Black);
                            col.Item().Text("Final Payment Receipt")
                               .FontSize(14).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // ----------------------------------------
                    // Main Content
                    // ----------------------------------------
                    page.Content().PaddingVertical(25).Column(col =>
                    {
                        col.Spacing(10);

                        // Customer & Vehicle Info
                        col.Item().Text($"Customer: {customer.Username}");
                        var localTime = receipt.IssuedAt.AddHours(2);
                        col.Item().Text($"Issued At: {localTime:dd-MM-yyyy HH:mm:ss}");
                        col.Item().Text($"Vehicle: {vehicle.Mark} {vehicle.Model}");
                        col.Item().Text($"Rental Period: {reservationStartDate:dd-MM-yyyy} to {reservationEndDate:dd-MM-yyyy}");
                        col.Item().Text($"Cost Per Day: €{costPerDay:F2}");

                        // Comparison table
                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(200); // Label
                                columns.RelativeColumn();   // Value
                            });

                            void AddRow(string label, string value)
                            {
                                table.Cell().Element(CellStyle).Text(label).FontSize(11).Bold();
                                table.Cell().Element(CellStyle).Text(value).FontSize(11);
                            }

                            // 1) Trip cost breakdown
                            AddRow("Number of Days:", numberOfDays.ToString());
                            AddRow(
                                "Trip Cost:",
                                $"€{totalTripCost:F2}  ( {numberOfDays} × €{costPerDay:F2} )"
                            );

                            // 2) Existing Damage Breakdown header
                            if (totalExistingDamage > 0)
                            {
                                table.Cell().ColumnSpan(2).Element(CellStyle)
                                     .Text("Existing Damage (Pre‐Condition):").FontSize(12).Bold();
                            }

                            if (existingScratchCost > 0)
                                AddRow("• Scratch (Existing):", $"€{existingScratchCost:F2}");
                            if (!string.IsNullOrWhiteSpace(existingScratchDescription))
                                AddRow("  – Description:", existingScratchDescription);

                            if (existingDentCost > 0)
                                AddRow("• Dent (Existing):", $"€{existingDentCost:F2}");
                            if (!string.IsNullOrWhiteSpace(existingDentDescription))
                                AddRow("  – Description:", existingDentDescription);

                            if (existingRustCost > 0)
                                AddRow("• Rust (Existing):", $"€{existingRustCost:F2}");
                            if (!string.IsNullOrWhiteSpace(existingRustDescription))
                                AddRow("  – Description:", existingRustDescription);

                            if (totalExistingDamage > 0)
                                AddRow("Total Existing Damage:", $"€{totalExistingDamage:F2}");

                            // 3) New (Extra) Damage Breakdown header
                            if (totalNewDamage > 0)
                            {
                                table.Cell().ColumnSpan(2).Element(CellStyle)
                                     .Text("New Damage (Post‐Condition):").FontSize(12).Bold();
                            }

                            if (newScratchCost > 0)
                                AddRow("• Scratch (New):", $"€{newScratchCost:F2}");
                            if (!string.IsNullOrWhiteSpace(newScratchDescription))
                                AddRow("  – Description:", newScratchDescription);

                            if (newDentCost > 0)
                                AddRow("• Dent (New):", $"€{newDentCost:F2}");
                            if (!string.IsNullOrWhiteSpace(newDentDescription))
                                AddRow("  – Description:", newDentDescription);

                            if (newRustCost > 0)
                                AddRow("• Rust (New):", $"€{newRustCost:F2}");
                            if (!string.IsNullOrWhiteSpace(newRustDescription))
                                AddRow("  – Description:", newRustDescription);

                            if (totalNewDamage > 0)
                                AddRow("Total New Damage:", $"€{totalNewDamage:F2}");

                            // 4) Overall Total Damage
                            //AddRow("Grand Total Damage:", $"€{totalDamage:F2}");

                            // 5) Insurance coverage & final liability
                            AddRow("Insurance Coverage:", $"{insuranceCoveragePct:F0}%");
                            AddRow("Final Liability to Customer:", $"€{finalLiability:F2}");

                            // 6) Separator row spanning two columns
                            table.Cell().ColumnSpan(2).Element(CellStyle).PaddingVertical(5)
                                 .Element(e => e.LineHorizontal(1).LineColor(Colors.Grey.Lighten1));

                            // 7) Amount Paid row
                            AddRow("Amount Paid:", $"€{receipt.Amount:F2}");
                        });
                    });

                    // ----------------------------------------
                    // Footer
                    // ----------------------------------------
                    page.Footer().Column(col =>
                    {
                        // Thank you on its own line
                        col.Item().AlignCenter().Text(text =>
                        {
                            text.Span("Thank you for choosing QuickRent Auto – your trusted vehicle rental system.")
                                .Italic().FontSize(11).FontColor(Colors.Grey.Darken1);
                        });

                        // Page numbers on next line
                        col.Item().AlignCenter().Text(text =>
                        {
                            text.Span("Page ").FontSize(10);
                            text.CurrentPageNumber().FontSize(10).Bold();
                            text.Span(" of ").FontSize(10);
                            text.TotalPages().FontSize(10).Bold();
                        });
                    });
                });
            }).GeneratePdf();
        }

        static IContainer CellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(Colors.Grey.Lighten2)
                .Padding(5)
                .AlignMiddle();
        }
    }
}
