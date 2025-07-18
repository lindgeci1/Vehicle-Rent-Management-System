using VRMS.Application.Dtos;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface ICustomerService
    {
        // Method to register or create a new customer
        Task<CustomerDto> CreateCustomer(CustomerDto customerDto);

        // Method to get a customer by their ID
        Task<CustomerDto> GetCustomerById(int customerId);


        // Method to update an existing customer
        Task<CustomerDto> UpdateCustomer(CustomerDto customerDto);

        // Method to delete a customer by their ID
        Task DeleteCustomer(int customerId);

        // Method to get all customers (optional)
        Task<IEnumerable<CustomerDto>> GetAllCustomers();
    }
}
