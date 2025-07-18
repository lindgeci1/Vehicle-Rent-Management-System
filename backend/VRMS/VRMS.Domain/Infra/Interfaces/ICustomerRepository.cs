using VRMS.Domain.Entities;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface ICustomerRepository
    {
        // Method to register or add a new customer
        Task AddCustomer(Customer customer);

        // Method to get a customer by their ID
        Task<Customer> GetCustomerById(int customerId);


        // Method to update an existing customer
        Task UpdateCustomer(Customer customer);

        // Method to delete a customer by their ID
        Task DeleteCustomer(int customerId);

        // Method to get all customers (optional)
        Task<IEnumerable<Customer>> GetAllCustomers();

        Task<bool> CustomerExistsByUserId(int userId);
    }
}
