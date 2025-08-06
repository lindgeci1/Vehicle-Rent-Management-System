using AutoMapper;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Repositories;

namespace VRMS.Application.Services
{
    public class ReceiptService(IReceiptRepository receiptRepository,ICustomerRepository customerRepository ,IPaymentRepository paymentRepository, IReservationRepository reservationRepository,IMapper mapper) : IReceiptService
    {
        public async Task<ReceiptDto> GetReceiptAsync(int id)
        {
            var receipt = await receiptRepository.GetReceiptByIdAsync(id);

            var receiptDto = mapper.Map<ReceiptDto>(receipt);

            return receiptDto;
        }

        public async Task<bool> InsertReceipt(ReceiptDto receiptDto)
        {
            if (receiptDto is null)
                return false;

            var receipt = mapper.Map<Receipt>(receiptDto);

            var success = await receiptRepository.InsertReceiptAsync(receipt);

            return success;
        }

        public async Task<bool> UpdateReceiptAsync(int id, ReceiptDto receiptDto)
        {
            var receipt = mapper.Map<Receipt>(receiptDto);

            return await receiptRepository.UpdateReceiptAsync(id, receipt);
        }

        public async Task<bool> DeleteReceiptAsync(int id)
        {
            return await receiptRepository.DeleteReceiptAsync(id);
        }

        public async Task<IEnumerable<ReceiptDto>> GetAllReceiptsAsync()
        {
            var receipts = await receiptRepository.GetAllReceiptsAsync();
            return mapper.Map<IEnumerable<ReceiptDto>>(receipts);
        }
        public async Task<string?> GetCustomerUsernameByReceiptIdAsync(int receiptId)
        {
            var receipt = await receiptRepository.GetReceiptByIdAsync(receiptId);
            if (receipt == null)
                throw new ArgumentException("Receipt not found.");

            var payment = await paymentRepository.GetPaymentByIdAsync(receipt.PaymentId);
            if (payment == null)
                throw new ArgumentException("Payment not found for the receipt.");

            var reservation = await reservationRepository.GetReservationById(payment.ReservationId);
            if (reservation == null)
                throw new ArgumentException("Reservation not found for the payment.");

            var customer = await customerRepository.GetCustomerById(reservation.CustomerId);
            if (customer == null)
                throw new ArgumentException("Customer not found for the reservation.");

            return customer.Username;
        }
        public async Task<IEnumerable<ReceiptDto>> GetReceiptsByCustomerIdAsync(int customerId)
        {
            var receipts = await receiptRepository.GetReceiptsByCustomerIdAsync(customerId);
            return mapper.Map<IEnumerable<ReceiptDto>>(receipts);
        }


        public async Task<ReceiptDto?> GetReceiptByPaymentIdAsync(int paymentId)
        {
            var receipt = await receiptRepository.GetReceiptByPaymentIdAsync(paymentId);
            if (receipt == null) return null;

            return mapper.Map<ReceiptDto>(receipt);
        }


    }
}
