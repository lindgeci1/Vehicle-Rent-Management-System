using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Text.RegularExpressions;
using BCrypt.Net;
using VRMS.Application.Interface;
namespace VRMS.Application.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IUserRepository _userRepository; // Added dependency
        private readonly IVehicleRatingRepository _vehicleRatingRepository;
        public CustomerService(ICustomerRepository customerRepository, IUserRepository userRepository, IVehicleRatingRepository vehicleRatingRepository)
        {
            _customerRepository = customerRepository;
            _userRepository = userRepository;
            _vehicleRatingRepository = vehicleRatingRepository;
        }

        // Register a new customer
        public async Task<CustomerDto> CreateCustomer(CustomerDto customerDto)
        {

            if (string.IsNullOrEmpty(customerDto.Email) &&
       string.IsNullOrEmpty(customerDto.Username) &&
       string.IsNullOrEmpty(customerDto.Password) &&
       string.IsNullOrEmpty(customerDto.DriverLicense) &&
       string.IsNullOrEmpty(customerDto.Address) &&
       string.IsNullOrEmpty(customerDto.PhoneNumber))
            {
                throw new ArgumentException("All fields are required.");
            }
            // Validate required fields
            if (string.IsNullOrEmpty(customerDto.Email))
            {
                throw new ArgumentException("Email is required.");
            }

            // Validate email format
            if (!Regex.IsMatch(customerDto.Email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"))
            {
                throw new ArgumentException("Invalid email format.");
            }

            if (string.IsNullOrEmpty(customerDto.Username))
            {
                throw new ArgumentException("Username is required.");
            }

            // Validate username (should only contain letters)
            if (customerDto.Username.Any(c => !char.IsLetter(c)))
            {
                throw new ArgumentException("Username should only contain letters.");
            }

            // Validate username (should only contain letters and be more than 4 characters)
            if (customerDto.Username.Length <= 4)
            {
                throw new ArgumentException("Username must be more than 4 characters.");
            }

            if (string.IsNullOrEmpty(customerDto.Password))
            {
                throw new ArgumentException("Password is required.");
            }
            var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
            if (!passwordRegex.IsMatch(customerDto.Password))
            {
                throw new ArgumentException("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }

            if (string.IsNullOrEmpty(customerDto.DriverLicense))
                throw new ArgumentException("DriverLicense is required.");

            var validCategories = new HashSet<string> {
    "AM", "A1", "A2", "A", "B1", "B", "C1", "C", "D1", "D",
    "Be", "C1E", "CE", "D1E", "DE"
};

            var selectedCategories = customerDto.DriverLicense
                .Split(',')
                .Select(c => c.Trim())
                .Where(c => !string.IsNullOrEmpty(c))
                .ToList();

            if (selectedCategories.Count == 0)
                throw new ArgumentException("At least one license category must be selected.");

            if (selectedCategories.Any(cat => !validCategories.Contains(cat)))
                throw new ArgumentException("One or more selected license categories are invalid. Allowed: " + string.Join(", ", validCategories));


            if (string.IsNullOrEmpty(customerDto.Address))
            {
                throw new ArgumentException("Address is required.");
            }

            // Validate phone number (should be 9 digits)
            if (string.IsNullOrEmpty(customerDto.PhoneNumber) || customerDto.PhoneNumber.Length != 9 || !customerDto.PhoneNumber.All(char.IsDigit))
            {
                throw new ArgumentException("Phone number should only contain 9 digits.");
            }

            // Use user repository methods to check if the email or username already exists
            var existingUserByEmail = await _userRepository.GetUserByEmail(customerDto.Email);
            if (existingUserByEmail != null)
                throw new Exception("A user with this email already exists.");

            var existingUserByUsername = await _userRepository.GetUserByUsername(customerDto.Username);
            if (existingUserByUsername != null)
                throw new Exception("A user with this username already exists.");

            // Hash the password using BCrypt
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(customerDto.Password);

            // Map the CustomerDto to the Customer entity (use hashedPassword instead of plain text)
            var customer = new Customer(
                userId: 0, // This would be auto-generated
                email: customerDto.Email,
                username: customerDto.Username,
                password: hashedPassword,
                driverLicense: customerDto.DriverLicense,
                address: customerDto.Address,
                phoneNumber: customerDto.PhoneNumber
            );

            // Automatically assign the default role (roleId 1) to the customer
            customer.UserRoles.Add(new UserRole(customer.UserId, 1));
            // Add the customer using the repository
            await _customerRepository.AddCustomer(customer);
            return new CustomerDto(customer); // ✅ return DTO to controller
        }

        // Update customer details
        public async Task<CustomerDto> UpdateCustomer(CustomerDto customerDto)
        {
            if (string.IsNullOrEmpty(customerDto.Email) &&
                string.IsNullOrEmpty(customerDto.Username) &&
                string.IsNullOrEmpty(customerDto.Password) &&
                string.IsNullOrEmpty(customerDto.DriverLicense) &&
                string.IsNullOrEmpty(customerDto.Address) &&
                string.IsNullOrEmpty(customerDto.PhoneNumber))
            {
                throw new ArgumentException("All fields are required.");
            }

            if (string.IsNullOrEmpty(customerDto.Email))
                throw new ArgumentException("Email is required.");

            if (!Regex.IsMatch(customerDto.Email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"))
                throw new ArgumentException("Invalid email format.");

            if (string.IsNullOrEmpty(customerDto.Username))
                throw new ArgumentException("Username is required.");

            if (customerDto.Username.Any(c => !char.IsLetter(c)))
                throw new ArgumentException("Username should only contain letters.");

            if (customerDto.Username.Length <= 4)
                throw new ArgumentException("Username must be more than 4 characters.");

            if (string.IsNullOrEmpty(customerDto.DriverLicense))
                throw new ArgumentException("DriverLicense is required.");

            // Valid license categories
            var validCategories = new HashSet<string> {
    "AM", "A1", "A2", "A", "B1", "B", "C1", "C", "D1", "D",
    "Be", "C1E", "CE", "D1E", "DE"
};

            // Assume the license string is comma-separated (e.g., "B,A1,CE")
            var selectedCategories = customerDto.DriverLicense.Split(',')
                .Select(c => c.Trim())
                .Where(c => !string.IsNullOrEmpty(c))
                .ToList();

            if (selectedCategories.Count == 0)
                throw new ArgumentException("At least one license category must be selected.");

            if (selectedCategories.Any(cat => !validCategories.Contains(cat)))
                throw new ArgumentException("One or more selected license categories are invalid.");


            if (string.IsNullOrEmpty(customerDto.Address))
                throw new ArgumentException("Address is required.");

            if (string.IsNullOrEmpty(customerDto.PhoneNumber) || customerDto.PhoneNumber.Length != 9 || !customerDto.PhoneNumber.All(char.IsDigit))
                throw new ArgumentException("Phone number should only contain 9 digits.");


            var existingCustomerById = await _customerRepository.GetCustomerById(customerDto.UserId);
            if (existingCustomerById == null)
                throw new ArgumentException("Customer not found.");

            var existingUserByEmail = await _userRepository.GetUserByEmail(customerDto.Email);
            if (existingUserByEmail != null && existingUserByEmail.UserId != customerDto.UserId)
                throw new Exception("A user with this email already exists.");

            var existingUserByUsername = await _userRepository.GetUserByUsername(customerDto.Username);
            if (existingUserByUsername != null && existingUserByUsername.UserId != customerDto.UserId)
                throw new Exception("A user with this username already exists.");

            string hashedPassword = existingCustomerById.Password;
            bool passwordChanged = false;

            if (!string.IsNullOrWhiteSpace(customerDto.Password))
            {
                bool isSame = BCrypt.Net.BCrypt.Verify(customerDto.Password, existingCustomerById.Password);
                if (!isSame)
                {
                    var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
                    if (!passwordRegex.IsMatch(customerDto.Password))
                    {
                        throw new ArgumentException("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
                    }

                    hashedPassword = BCrypt.Net.BCrypt.HashPassword(customerDto.Password);
                    passwordChanged = true;
                    Console.WriteLine($"✅ Password was changed and re-hashed for user: {customerDto.Email}");
                }
            }
            else
            {
                Console.WriteLine($"ℹ️ Password was not changed for user: {customerDto.Email}");
            }



            // 🛡️ Preserve refresh token
            string? existingRefreshToken = existingCustomerById.RefreshToken;
            DateTime? existingRefreshExpiry = existingCustomerById.RefreshTokenExpiryTime;

            var customer = new Customer(
                userId: customerDto.UserId,
                email: customerDto.Email,
                username: customerDto.Username,
                password: hashedPassword,
                driverLicense: customerDto.DriverLicense,
                address: customerDto.Address,
                phoneNumber: customerDto.PhoneNumber
            )
            {
                RefreshToken = existingRefreshToken,
                RefreshTokenExpiryTime = existingRefreshExpiry
            };

            // 👑 Preserve role(s)
            customer.UserRoles = existingCustomerById.UserRoles;

            await _customerRepository.UpdateCustomer(customer);
            return new CustomerDto(customer); // ✅ return DTO to controller
        }


        public async Task<CustomerDto> GetCustomerById(int customerId)
        {
            var customer = await _customerRepository.GetCustomerById(customerId);

            if (customer != null)
            {
                return new CustomerDto(customer);
            }

            return null; // Return null if customer is not found
        }

        // Delete a customer by ID
        public async Task DeleteCustomer(int customerId)
        {
            var existingCustomer = await _customerRepository.GetCustomerById(customerId);
            if (existingCustomer == null)
            {
                throw new ArgumentException("Customer not found.");
            }

            var ratings = await _vehicleRatingRepository.GetVehicleRatingsByCustomerId(customerId);
            if (ratings != null && ratings.Any())
            {
                foreach (var rating in ratings)
                {
                    await _vehicleRatingRepository.DeleteVehicleRating(rating.Id);
                }
            }

            // Delete the customer from the repository
            await _userRepository.DeleteUser(customerId);
        }

        // Get all customers
        public async Task<IEnumerable<CustomerDto>> GetAllCustomers()
        {
            var customers = await _customerRepository.GetAllCustomers();
            return customers.Select(c => new CustomerDto(c));
        }
    }
}
