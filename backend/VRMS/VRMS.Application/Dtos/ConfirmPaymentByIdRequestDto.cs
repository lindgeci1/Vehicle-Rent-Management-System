public class ConfirmPaymentByIdRequestDto
{
    public int PaymentId { get; set; } // primary key
    public string PaymentMethodId { get; set; }
}