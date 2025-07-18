using System;

namespace VRMS.Domain.Entities
{
    public class Customer : User
    {
        public Customer(int userId, string email, string username, string password, string? driverLicense, string? address, string? phoneNumber)
            : base(userId, email, username, password)
        {
            DriverLicense = driverLicense;
            Address = address;
            PhoneNumber = phoneNumber;
        }

        public string? DriverLicense { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }

        // Each Customer can have ONE InsurancePolicy
        public InsurancePolicy? InsurancePolicy { get; set; }

        // ✅ A Customer can have ONLY ONE Reservation at a time
        public ICollection<Reservation>? Reservations { get; set; }
    }
}
