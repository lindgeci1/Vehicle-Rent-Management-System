using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public sealed record ReceiptDto
    {
        public ReceiptDto(int receiptId, int paymentId, string receiptType, decimal amount, DateTime issuedAt, byte[] receiptData)
        {
            ReceiptId = receiptId;
            PaymentId = paymentId;
            ReceiptType = receiptType;
            Amount = amount;
            IssuedAt = issuedAt;
            ReceiptData = receiptData;
        }

        public int ReceiptId { get; set; }
        public int PaymentId { get; set; }

        public string ReceiptType { get; set; }
        public decimal Amount { get; set; }
        public DateTime IssuedAt { get; set; }

        public byte[] ReceiptData { get; set; }

       
    }
}
