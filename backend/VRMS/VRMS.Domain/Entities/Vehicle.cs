using System;
using System.Collections.Generic;

namespace VRMS.Domain.Entities
{
    public class Vehicle
    {
        public Vehicle(int vehicleId, string mark, string model, int year, decimal prepayFee, string category, string fuelType, int seatingCapacity, bool isAvailable, string transmission)
        {
            VehicleId = vehicleId;
            Mark = mark;
            Model = model;
            Year = year;
            PrepayFee = prepayFee > 0 ? prepayFee : 0; // ✅ Ensure valid prepay fee
            Category = category; // ✅ "Car", "Bus", "Bike", "Truck", etc.
            FuelType = fuelType;
            SeatingCapacity = seatingCapacity;
            IsAvailable = isAvailable;
            CreatedAt = DateTime.UtcNow; // ✅ Standard timestamp
            Reservations = new List<Reservation>(); // ✅ Always initialize
            Photos = new List<Photo>();
            Transmission = transmission;
        }

        public int VehicleId { get; set; } // Primary Key
        public string Mark { get; set; } // ✅ Manufacturer (Toyota, Ford, etc.)
        public string Model { get; set; } // Model name
        public int Year { get; set; } // Manufacturing Year
        public decimal PrepayFee { get; set; } // Prepayment fee before reservation
        public string Category { get; set; } // ✅ "Car", "Bus", "Bike", "Truck", etc.
        public string FuelType { get; set; } // Diesel, Petrol, Electric, Hybrid
        public int SeatingCapacity { get; set; } // Number of seats
        public bool IsAvailable { get; set; } // Available for rental
        public DateTime CreatedAt { get; set; } // ✅ Standard field

        public string Transmission { get; set; }

        // ✅ Navigation Property to track Reservations
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>(); // ✅ Always initialized
        public ICollection<TripDetails> TripDetails { get; set; } = new List<TripDetails>();
        public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    }
}
