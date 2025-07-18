using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Services
{
    public static class PrePaymentReceiptPdfGenerator
    {
        /// <summary>
        /// Generates a PDF for a prepayment. Shows customer, vehicle, optional rental period/cost‐per‐day,
        /// and the amount paid. No damage or trip cost breakdown.
        /// </summary>
        public static byte[] Generate(
            Receipt receipt,
            Customer customer,
            Vehicle vehicle,
            DateTime? reservationStartDate = null,
            DateTime? reservationEndDate = null,
            decimal? costPerDay = null)
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
                            col.Item().Text("QuickRent Auto")
                               .FontSize(18).Bold().FontColor(Colors.Black);
                            col.Item().Text("Prepayment Receipt")
                               .FontSize(14).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // Main Content
                    page.Content().PaddingVertical(25).Column(col =>
                    {
                        col.Spacing(10);

                        // Customer & Vehicle Info
                        col.Item().Text($"Customer: {customer.Username}");
                        var localTime = receipt.IssuedAt.AddHours(2);
                        col.Item().Text($"Issued At: {localTime:dd-MM-yyyy HH:mm:ss}");
                        col.Item().Text($"Vehicle: {vehicle.Mark} {vehicle.Model}");

                        // Optional rental period
                        if (reservationStartDate.HasValue && reservationEndDate.HasValue)
                        {
                            col.Item().Text($"Rental Period: {reservationStartDate.Value:dd-MM-yyyy} to {reservationEndDate.Value:dd-MM-yyyy}");
                        }

                        // Optional cost per day
                        if (costPerDay.HasValue)
                        {
                            col.Item().Text($"Cost Per Day: €{costPerDay.Value:F2}");
                        }

                        // Separator line
                        col.Item().PaddingVertical(10).Element(e =>
                        {
                            e.LineHorizontal(1).LineColor(Colors.Grey.Lighten1);
                        });

                        // Amount Paid
                        col.Item().AlignRight().Text(text =>
                        {
                            text.Span("Amount Paid: ").Bold();
                            text.Span($"€{receipt.Amount:F2}").FontSize(14).FontColor(Colors.Black).Bold();
                        });
                    });

                    // Footer
                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Thank you for choosing QuickRent Auto – your trusted vehicle rental system.")
                         .Italic().FontSize(11).FontColor(Colors.Grey.Darken1);
                        x.Span("Page ").FontSize(10);
                        x.CurrentPageNumber().FontSize(10).Bold();
                        x.Span(" of ").FontSize(10);
                        x.TotalPages().FontSize(10).Bold();
                    });
                });
            }).GeneratePdf();
        }
    }
}
