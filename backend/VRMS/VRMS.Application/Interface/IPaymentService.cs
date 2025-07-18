using VRMS.Application.Dtos;
using VRMS.Domain.Entities;

namespace VRMS.Application.Interface
{
    public interface IPaymentService
    {
        public Task<PaymentDto> GetPaymentAsync(int id);

        public Task<bool> InsertPayment(PaymentDto paymentDto);

        public Task<bool> UpdatePaymentAsync(int id, PaymentDto paymentDto);

        public Task<bool> DeletePaymentAsync(int id);

        public Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync();

        Task<PaymentDto> CreatePaymentIntentAsync(CreatePaymentIntentRequestDto dto);

        Task<bool> ConfirmPaymentByIdAsync(ConfirmPaymentByIdRequestDto dto);

        Task<string?> GetCustomerUsernameByPaymentIdAsync(int paymentId);

        Task<PaymentDto?> GetPaymentByReservationIdAsync(int reservationId);

        Task<PaymentDto> CreateFinalPaymentForReservationAsync(int reservationId);
        Task<bool> ConfirmFinalPaymentByIdAsync(ConfirmPaymentByIdRequestDto dto);

        Task<IEnumerable<PaymentDto>> GetPaymentsByCustomerIdAsync(int customerId);

        Task RefundReservationAsync(int reservationId);


    }
}
