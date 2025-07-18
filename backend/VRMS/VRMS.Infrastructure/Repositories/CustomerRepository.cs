using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly VRMSDbContext _context;

        public CustomerRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Method to add a new customer
        public async Task AddCustomer(Customer customer)
        {
            await _context.Customers.AddAsync(customer); // Add the customer to the DbContext
            await _context.SaveChangesAsync(); // Save changes to the database
        }

        // Method to get a customer by their ID
        public async Task<Customer> GetCustomerById(int customerId)
        {
            return await _context.Customers.AsNoTracking()  // Use AsNoTracking to prevent tracking issues
                .FirstOrDefaultAsync(c => c.UserId == customerId); // Get customer by UserId
        }
        // Method to update an existing customer's data
        public async Task UpdateCustomer(Customer customer)
        {
            // Check if an instance with the same key is already tracked
            var localCustomer = _context.Customers.Local.FirstOrDefault(c => c.UserId == customer.UserId);
            if (localCustomer != null)
            {
                // Update the tracked instance with new values
                _context.Entry(localCustomer).CurrentValues.SetValues(customer);
            }
            else
            {
                // Otherwise, attach the entity (if it's not already tracked)
                _context.Customers.Update(customer);
            }
            await _context.SaveChangesAsync();
        }


        // Method to delete a customer by their ID
        public async Task DeleteCustomer(int customerId)
        {
            var customer = await GetCustomerById(customerId);
            if (customer != null)
            {
                _context.Customers.Remove(customer); // Remove the customer from the DbContext
                await _context.SaveChangesAsync(); // Save changes to the database
            }
        }

        // Method to get all customers (optional)
        public async Task<IEnumerable<Customer>> GetAllCustomers()
        {
            return await _context.Customers.AsNoTracking().ToListAsync(); // Get all customers without tracking
        }

        public async Task<bool> CustomerExistsByUserId(int userId)
        {
            return await _context.Customers.AnyAsync(c => c.UserId == userId);
        }
    }
}
