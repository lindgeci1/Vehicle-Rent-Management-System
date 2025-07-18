using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Services
{
    public static class PostConditionPdfGenerator
    {
        /// <summary>
        /// Generate a PDF that shows both the “pre‐condition” and “post‐condition”
        /// side‐by‐side, including per‐category damage values (scratches, dents, rust)
        /// as well as the overall total cost.
        /// </summary>
        public static byte[] Generate(
            VehiclePreCondition preCondition,
            VehiclePostCondition postCondition)
        {
            // Recompute per‐category damage costs using the same logic as in service:
            double scratchCost = 0;
            if (!preCondition.HasScratches && postCondition.HasScratches)
                scratchCost = 100;
            else if (preCondition.HasScratches && postCondition.HasScratches
                     && !string.Equals(
                         preCondition.ScratchDescription?.Trim(),
                         postCondition.ScratchDescription?.Trim(),
                         StringComparison.OrdinalIgnoreCase))
                scratchCost = 50;

            double dentCost = 0;
            if (!preCondition.HasDents && postCondition.HasDents)
                dentCost = 150;
            else if (preCondition.HasDents && postCondition.HasDents
                     && !string.Equals(
                         preCondition.DentDescription?.Trim(),
                         postCondition.DentDescription?.Trim(),
                         StringComparison.OrdinalIgnoreCase))
                dentCost = 75;

            double rustCost = 0;
            if (!preCondition.HasRust && postCondition.HasRust)
                rustCost = 200;
            else if (preCondition.HasRust && postCondition.HasRust
                     && !string.Equals(
                         preCondition.RustDescription?.Trim(),
                         postCondition.RustDescription?.Trim(),
                         StringComparison.OrdinalIgnoreCase))
                rustCost = 100;

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
                               .FontSize(20).Bold();

                            col.Item().Text("Vehicle Condition Report (Before & After)")
                               .FontSize(14)
                               .FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // ----------------------------------------
                    // Main Content
                    // ----------------------------------------
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Spacing(20);

                        // Overview Section: IDs and Timestamps
                        col.Item().Column(inner =>
                        {
                            inner.Spacing(5);
                            inner.Item().Text($"Condition Pair ID: {postCondition.Id}")
                                .FontSize(12).Bold();
                            inner.Item().Text($"Vehicle ID: {postCondition.VehicleId}")
                                .FontSize(12);

                            inner.Item().Row(row2 =>
                            {
                                row2.RelativeItem().Text(
                                    $"Captured At (Pre): {preCondition.CreatedAt.AddHours(2):dd-MM-yyyy HH:mm}"
                                ).FontSize(11);
                                row2.RelativeItem().Text(
                                    $"Captured At (Post): {postCondition.CreatedAt.AddHours(2):dd-MM-yyyy HH:mm}"
                                ).FontSize(11);
                            });
                        });

                        col.Item().PaddingTop(10).Text("Detailed Comparison:")
                            .FontSize(13).Bold();

                        // Comparison Table (Pre vs. Post)
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(120); // “Attribute” label
                                columns.RelativeColumn();   // Pre value
                                columns.RelativeColumn();   // Post value
                            });

                            // Header row
                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Attribute").FontSize(11).Bold();
                                header.Cell().Element(CellStyle).Text("Before").FontSize(11).Bold();
                                header.Cell().Element(CellStyle).Text("After").FontSize(11).Bold();
                            });

                            // Scratches row
                            table.Cell().Element(CellStyle).Text("Scratches:");
                            table.Cell().Element(CellStyle)
                                .Text(preCondition.HasScratches ? "Yes" : "No");
                            table.Cell().Element(CellStyle)
                                .Text(postCondition.HasScratches ? "Yes" : "No");

                            // Scratches description row
                            bool showScratchDesc = preCondition.HasScratches || postCondition.HasScratches;
                            if (showScratchDesc)
                            {
                                table.Cell().Element(CellStyle).Text("Scratch Desc:");
                                table.Cell().Element(CellStyle).Text(
                                    preCondition.HasScratches
                                        ? (string.IsNullOrWhiteSpace(preCondition.ScratchDescription)
                                            ? "—"
                                            : preCondition.ScratchDescription)
                                        : "—"
                                );
                                table.Cell().Element(CellStyle).Text(
                                    postCondition.HasScratches
                                        ? (string.IsNullOrWhiteSpace(postCondition.ScratchDescription)
                                            ? "—"
                                            : postCondition.ScratchDescription)
                                        : "—"
                                );
                            }

                            // Scratches cost row
                            table.Cell().Element(CellStyle).Text("Damage Cost (Scratches):");
                            table.Cell().Element(CellStyle).Text("€0.00");
                            table.Cell().Element(CellStyle).Text($"€{scratchCost:F2}");

                            // Dents row
                            table.Cell().Element(CellStyle).Text("Dents:");
                            table.Cell().Element(CellStyle)
                                .Text(preCondition.HasDents ? "Yes" : "No");
                            table.Cell().Element(CellStyle)
                                .Text(postCondition.HasDents ? "Yes" : "No");

                            // Dent description row
                            bool showDentDesc = preCondition.HasDents || postCondition.HasDents;
                            if (showDentDesc)
                            {
                                table.Cell().Element(CellStyle).Text("Dent Desc:");
                                table.Cell().Element(CellStyle).Text(
                                    preCondition.HasDents
                                        ? (string.IsNullOrWhiteSpace(preCondition.DentDescription)
                                            ? "—"
                                            : preCondition.DentDescription)
                                        : "—"
                                );
                                table.Cell().Element(CellStyle).Text(
                                    postCondition.HasDents
                                        ? (string.IsNullOrWhiteSpace(postCondition.DentDescription)
                                            ? "—"
                                            : postCondition.DentDescription)
                                        : "—"
                                );
                            }

                            // Dents cost row
                            table.Cell().Element(CellStyle).Text("Damage Cost (Dents):");
                            table.Cell().Element(CellStyle).Text("€0.00");
                            table.Cell().Element(CellStyle).Text($"€{dentCost:F2}");

                            // Rust row
                            table.Cell().Element(CellStyle).Text("Rust:");
                            table.Cell().Element(CellStyle)
                                .Text(preCondition.HasRust ? "Yes" : "No");
                            table.Cell().Element(CellStyle)
                                .Text(postCondition.HasRust ? "Yes" : "No");

                            // Rust description row
                            bool showRustDesc = preCondition.HasRust || postCondition.HasRust;
                            if (showRustDesc)
                            {
                                table.Cell().Element(CellStyle).Text("Rust Desc:");
                                table.Cell().Element(CellStyle).Text(
                                    preCondition.HasRust
                                        ? (string.IsNullOrWhiteSpace(preCondition.RustDescription)
                                            ? "—"
                                            : preCondition.RustDescription)
                                        : "—"
                                );
                                table.Cell().Element(CellStyle).Text(
                                    postCondition.HasRust
                                        ? (string.IsNullOrWhiteSpace(postCondition.RustDescription)
                                            ? "—"
                                            : postCondition.RustDescription)
                                        : "—"
                                );
                            }

                            // Rust cost row
                            table.Cell().Element(CellStyle).Text("Damage Cost (Rust):");
                            table.Cell().Element(CellStyle).Text("€0.00");
                            table.Cell().Element(CellStyle).Text($"€{rustCost:F2}");

                            // Total cost row
                            table.Cell().Element(CellStyle).Text("Total Cost:");
                            //table.Cell().Element(CellStyle).Text($"€{preCondition.TotalCost:F2}");
                            table.Cell().Element(CellStyle).Text($"€{postCondition.TotalCost:F2}");
                        });

                        // Separator Line
                        col.Item().PaddingVertical(10).Element(e =>
                        {
                            e.LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                        });

                        // Footer Note
                        col.Item().AlignCenter().Text(text =>
                        {
                            text.Span("End of Condition Comparison Report")
                                .Italic()
                                .FontSize(11)
                                .FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // Footer with page numbers
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.Span("Page ").FontSize(10);
                        text.CurrentPageNumber().FontSize(10).Bold();
                        text.Span(" of ").FontSize(10);
                        text.TotalPages().FontSize(10).Bold();
                    });
                });
            })
            .GeneratePdf();
        }

        // A reusable style for table cells
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
