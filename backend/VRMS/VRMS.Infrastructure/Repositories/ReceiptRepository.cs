using Microsoft.EntityFrameworkCore;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;

namespace VRMS.Infrastructure.Repositories
{
    public class ReceiptRepository(VRMSDbContext vRMSDbContext) : IReceiptRepository
    {
        public async Task<bool> DeleteReceiptAsync(int id)
        {
            var receipt = await GetReceiptByIdAsync(id);

            if (receipt is null)
                return false;

            vRMSDbContext.Receipts.Remove(receipt);
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }
        public async Task<Receipt?> GetReceiptByPaymentIdAsync(int paymentId)
        {
            return await vRMSDbContext.Receipts
                .FirstOrDefaultAsync(r => r.PaymentId == paymentId);
        }

        public async Task<Receipt> GetReceiptByIdAsync(int id) =>
            await vRMSDbContext.Receipts.FirstOrDefaultAsync(x => x.ReceiptId == id);

        public async Task<bool> InsertReceiptAsync(Receipt receipt)
        {
            if (receipt == null)
                return false;

            await vRMSDbContext.Receipts.AddAsync(receipt);
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateReceiptAsync(int id, Receipt receiptUpdate)
        {
            var receipt = await GetReceiptByIdAsync(id);

            if (receipt is null)
                return false;

            receipt.PaymentId = receiptUpdate.PaymentId;
            receipt.ReceiptType = receiptUpdate.ReceiptType;
            receipt.Amount = receiptUpdate.Amount;
            receipt.IssuedAt = receiptUpdate.IssuedAt;
            receipt.ReceiptData = receiptUpdate.ReceiptData;

            vRMSDbContext.Update(receipt);
            await vRMSDbContext.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<Receipt>> GetAllReceiptsAsync() =>
            await vRMSDbContext.Receipts.ToListAsync();

        public async Task<IEnumerable<Receipt>> GetReceiptsByCustomerIdAsync(int customerId)
        {
            return await vRMSDbContext.Receipts
                .Include(r => r.Payment)
                    .ThenInclude(p => p.Reservation)
                .Where(r => r.Payment != null &&
                            r.Payment.Reservation != null &&
                            r.Payment.Reservation.CustomerId == customerId)
                .ToListAsync();
        }

    }
}
