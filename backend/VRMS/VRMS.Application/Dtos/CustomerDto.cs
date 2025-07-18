using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class CustomerDto
    {
        // Parameterless constructor for potential deserialization
        public CustomerDto() { }

        // Constructor that maps the Customer entity to the DTO
        public CustomerDto(Customer customer)
        {
            UserId = customer.UserId;
            Email = customer.Email;
            Username = customer.Username;
            Password = customer.Password;
            DriverLicense = customer.DriverLicense;
            Address = customer.Address;
            PhoneNumber = customer.PhoneNumber;
        }

        // The properties you want to expose via the DTO
        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; } // Optional, depending on your use case
        public string? DriverLicense { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }

        // Optional: Include any relationships (like InsurancePolicy, Reservation, etc.)
        // If you want to send more related data (InsurancePolicy, Reservation), you can include it here.
        //public InsurancePolicyDto? InsurancePolicy { get; set; }
        //public ReservationDto? Reservation { get; set; }
    }
}
