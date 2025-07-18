using Microsoft.EntityFrameworkCore;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;

namespace VRMS.Infrastructure.Repositories
{
    public class PaymentRepository(VRMSDbContext vRMSDbContext) : IPaymentRepository
    {
        public async Task<bool> DeletePaymentAsync(int id)
        {
            var payment = await GetPaymentByIdAsync(id);

            if (payment is null)
                return false;

            vRMSDbContext.Payments.Remove(payment); 
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }
        public async Task<Payment?> GetFirstPaymentByReservationIdAsync(int reservationId)
        {
            return await vRMSDbContext.Payments
                .Include(p => p.Reservation)
                .FirstOrDefaultAsync(p => p.ReservationId == reservationId && p.PaymentStatus == "pre-paid");
        }
        public async Task<List<Payment>> GetConfirmedPaymentsPendingCleanupAsync()
        {
            return await vRMSDbContext.Payments
                .Include(p => p.Reservation)
                .Where(p => p.PaymentStatus == "paid")
                .ToListAsync();
        }
        public async Task<List<Payment>> GetPaymentsByReservationIdAsync(int reservationId)
        {
            return await vRMSDbContext.Payments
                .Where(p => p.ReservationId == reservationId)
                .ToListAsync();
        }


        public async Task<IEnumerable<Payment>> GetPendingPaymentsInWindowAsync(DateTime from, DateTime to)
        {
            return await vRMSDbContext.Payments
                .Include(p => p.Reservation)
                .Where(p => p.PaymentStatus == "pending" &&
                            p.Reservation.CreatedAt >= from &&
                            p.Reservation.CreatedAt <= to)
                .ToListAsync();
        }

        public async Task<Reservation?> GetReservationWithCustomerAsync(int reservationId)
        {
            return await vRMSDbContext.Reservations
                .Include(r => r.Customer)
                .Include(r => r.Vehicle) // 👈 required!
                .FirstOrDefaultAsync(r => r.ReservationId == reservationId);
        }


        public async Task<Payment?> GetPendingPaymentByReservationIdAsync(int reservationId)
        {
            return await vRMSDbContext.Payments
                .FirstOrDefaultAsync(p => p.ReservationId == reservationId && p.PaymentStatus == "pending");
        }


        public async Task<Payment> GetPaymentByIdAsync(int id) =>
            await vRMSDbContext.Payments.FirstOrDefaultAsync(x => x.PaymentId == id);

        public async Task<bool> InsertPaymentAsync(Payment payment)
        {
            if (payment == null)
                return false;

            await vRMSDbContext.Payments.AddAsync(payment);
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdatePaymentAsync(int id, Payment paymentUpdate)
        {
            var payment = await GetPaymentByIdAsync(id);

            if (payment is null)
                return false;

            payment.DateIssued = paymentUpdate.DateIssued;
            payment.Description = paymentUpdate.Description;
            payment.PrepaymentAmount = paymentUpdate.PrepaymentAmount;
            payment.TotalPrice = paymentUpdate.TotalPrice;
            payment.PaymentStatus = paymentUpdate.PaymentStatus;
            payment.StripePaymentIntentId = paymentUpdate.StripePaymentIntentId;
            payment.StripeClientSecret = paymentUpdate.StripeClientSecret;
            payment.StripeStatus = paymentUpdate.StripeStatus;
            payment.Reservation = paymentUpdate.Reservation;
            payment.Receipt = paymentUpdate.Receipt;

            vRMSDbContext.Update(payment);
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<Payment>> GetAllPaymentsAsync()
        {
            return await vRMSDbContext.Payments
                .Include(p => p.Reservation) // ✅ critical
                .ToListAsync();
        }

        public async Task<Payment?> GetByReservationIdAsync(int reservationId)
        {
            return await vRMSDbContext.Payments
                .FirstOrDefaultAsync(p => p.ReservationId == reservationId);
        }

        public async Task UpdateAsync(Payment payment)
        {
            vRMSDbContext.Payments.Update(payment);
            await vRMSDbContext.SaveChangesAsync();
        }
    }
}
