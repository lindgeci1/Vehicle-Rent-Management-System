using VRMS.Domain.Entities;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IReceiptRepository
    {
        public Task<bool> InsertReceiptAsync(Receipt receipt);

        public Task<bool> UpdateReceiptAsync(int id, Receipt receipt);

        public Task<Receipt> GetReceiptByIdAsync(int id);

        public Task<bool> DeleteReceiptAsync(int id);

        public Task<IEnumerable<Receipt>> GetAllReceiptsAsync();

        Task<IEnumerable<Receipt>> GetReceiptsByCustomerIdAsync(int customerId);
    }
}
