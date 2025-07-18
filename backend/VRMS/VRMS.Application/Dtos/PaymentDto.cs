namespace VRMS.Application.Dtos
{
    public sealed record PaymentDto
    {
        public int PaymentId { get; init; }

        public int ReservationId { get; init; }

        public DateTime? DateIssued { get; init; }

        public string? Description { get; init; }

        public decimal PrepaymentAmount { get; init; }

        public decimal? TotalPrice { get; init; }

        public string PaymentStatus { get; init; }

        public string StripePaymentIntentId { get; init; }

        public string StripeClientSecret { get; init; }

        public string StripeStatus { get; init; } =  "initiated";

        public bool IsRefunded { get; init; }
        public DateTime? RefundedAt { get; init; }
        public string? StripeRefundId { get; init; }
    }
}
