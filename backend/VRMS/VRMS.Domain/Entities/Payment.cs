using System;

namespace VRMS.Domain.Entities
{
    public class Payment
    {
        public Payment()
        {
            
        }
        public Payment(int paymentId, int reservationId, decimal prepaymentAmount, decimal? totalPrice, string stripePaymentIntentId, string stripeClientSecret, string paymentStatus)
        {
            PaymentId = paymentId;
            ReservationId = reservationId; 
            PrepaymentAmount = prepaymentAmount; 
            TotalPrice = totalPrice; 
            PaymentStatus = paymentStatus; 
            StripePaymentIntentId = stripePaymentIntentId;
            StripeClientSecret = stripeClientSecret;
            StripeStatus = "initiated"; 
            DateIssued = null; 
        }

        public int PaymentId { get; set; } 
        public int ReservationId { get; set; }

        public DateTime? DateIssued { get; set; } 
        public string? Description { get; set; } 
        public decimal PrepaymentAmount { get; set; } 
        public decimal? TotalPrice { get; set; } 
        public string PaymentStatus { get; set; } 

        // ✅ Stripe Integration Fields
        public string StripePaymentIntentId { get; set; } 
        public string StripeClientSecret { get; set; } 
        public string StripeStatus { get; set; } 

        // ✅ Navigation Property
        public Reservation Reservation { get; set; } = null!;
        public Receipt? Receipt { get; set; }
        public bool IsRefunded { get; set; }
        public DateTime? RefundedAt { get; set; }
        public string? StripeRefundId { get; set; }
    }
}
