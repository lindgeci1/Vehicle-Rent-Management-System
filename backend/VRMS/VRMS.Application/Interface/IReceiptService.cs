using VRMS.Application.Dtos;

namespace VRMS.Application.Interface
{
    public interface IReceiptService
    {
        Task<ReceiptDto> GetReceiptAsync(int id);
        Task<bool> InsertReceipt(ReceiptDto receiptDto);
        Task<bool> UpdateReceiptAsync(int id, ReceiptDto receiptDto);
        Task<bool> DeleteReceiptAsync(int id);
        Task<IEnumerable<ReceiptDto>> GetAllReceiptsAsync();

        Task<string?> GetCustomerUsernameByReceiptIdAsync(int receiptId);
        Task<IEnumerable<ReceiptDto>> GetReceiptsByCustomerIdAsync(int customerId);

        Task<ReceiptDto?> GetReceiptByPaymentIdAsync(int paymentId);
    }
}
