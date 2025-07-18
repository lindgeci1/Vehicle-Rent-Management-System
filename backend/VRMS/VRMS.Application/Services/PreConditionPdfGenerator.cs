// 1. PDF Generator (uses QuestPDF to render the given pre‐condition data into a PDF)
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VRMS.Domain.Entities;

namespace VRMS.Application.Services
{
    public static class PreConditionPdfGenerator
    {
        public static byte[] Generate(VehiclePreCondition preCondition)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily("Times New Roman"));

                    // Header
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("QuickRent Auto").FontSize(20).Bold();
                            col.Item().Text("Vehicle Pre-Condition Report")
                                .FontSize(14)
                                .FontColor(Colors.Grey.Darken2);
                            //col.Item().PaddingTop(5).Text($"{DateTime.UtcNow:dd-MM-yyyy HH:mm}")
                            //    .FontSize(10).FontColor(Colors.Grey.Lighten2);
                        });
                    });

                    // Main Content
                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Spacing(15);

                        // Overview Section
                        col.Item().Column(inner =>
                        {
                            inner.Spacing(5);
                            inner.Item().Text($"Pre-Condition ID: {preCondition.Id}")
                                .FontSize(12).Bold();
                            inner.Item().Text($"Vehicle ID: {preCondition.VehicleId}")
                                .FontSize(12);
                            inner.Item().Text($"Created At: {preCondition.CreatedAt.AddHours(2):dd-MM-yyyy HH:mm}")
                                .FontSize(12);

                        });

                        col.Item().PaddingTop(10).Text("Condition Details:")
                            .FontSize(13).Bold();

                        // Details List
                        col.Item().Column(details =>
                        {
                            details.Spacing(8);

                            details.Item().Text($"• Scratches: {(preCondition.HasScratches ? "Yes" : "No")}")
                                .FontSize(12);
                            if (preCondition.HasScratches && !string.IsNullOrEmpty(preCondition.ScratchDescription))
                            {
                                details.Item().PaddingLeft(15).Text($"Description: {preCondition.ScratchDescription}")
                                    .FontSize(11).FontColor(Colors.Grey.Darken1);
                            }

                            details.Item().Text($"• Dents: {(preCondition.HasDents ? "Yes" : "No")}")
                                .FontSize(12);
                            if (preCondition.HasDents && !string.IsNullOrEmpty(preCondition.DentDescription))
                            {
                                details.Item().PaddingLeft(15).Text($"Description: {preCondition.DentDescription}")
                                    .FontSize(11).FontColor(Colors.Grey.Darken1);
                            }

                            details.Item().Text($"• Rust: {(preCondition.HasRust ? "Yes" : "No")}")
                                .FontSize(12);
                            if (preCondition.HasRust && !string.IsNullOrEmpty(preCondition.RustDescription))
                            {
                                details.Item().PaddingLeft(15).Text($"Description: {preCondition.RustDescription}")
                                    .FontSize(11).FontColor(Colors.Grey.Darken1);
                            }
                        });

                        // Separator Line
                        col.Item().PaddingVertical(10).Element(e =>
                        {
                            e.LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                        });

                        // Footer Note
                        col.Item().AlignCenter().Text(text =>
                        {
                            text.Span("End of Pre-Condition Report")
                                .Italic().FontSize(11).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // Footer (no raw Func placeholder—use proper page number calls)
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
    }
}
