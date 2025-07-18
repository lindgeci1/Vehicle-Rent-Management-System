using VRMS.Domain.Entities;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IPaymentRepository
    {
        public Task<bool> InsertPaymentAsync(Payment payment);

        public Task<bool> UpdatePaymentAsync(int id, Payment payment);

        public Task<Payment> GetPaymentByIdAsync(int id);

        public Task<bool> DeletePaymentAsync(int id);

        public Task<IEnumerable<Payment>> GetAllPaymentsAsync();

        Task<Reservation?> GetReservationWithCustomerAsync(int reservationId);
        Task<Payment?> GetPendingPaymentByReservationIdAsync(int reservationId);

        Task<IEnumerable<Payment>> GetPendingPaymentsInWindowAsync(DateTime from, DateTime to);

        Task<Payment?> GetFirstPaymentByReservationIdAsync(int reservationId);

        Task<List<Payment>> GetConfirmedPaymentsPendingCleanupAsync();
        Task<List<Payment>> GetPaymentsByReservationIdAsync(int reservationId);

        Task<Payment> GetByReservationIdAsync(int reservationId);
        Task UpdateAsync(Payment payment);

    }
}

