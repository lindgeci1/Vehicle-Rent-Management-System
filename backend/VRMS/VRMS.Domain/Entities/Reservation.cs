using System;

namespace VRMS.Domain.Entities
{
    public class Reservation
    {
        public Reservation(int reservationId, int customerId, int vehicleId, DateTime startDate, DateTime endDate, ReservationStatus status)
        {
            ReservationId = reservationId;
            CustomerId = customerId;
            VehicleId = vehicleId;
            StartDate = startDate;
            EndDate = endDate;
            Status = status;
            CreatedAt = DateTime.UtcNow; // Auto-set on creation
            PickedUp = false;
            BroughtBack = false;
            IsLate = false;
            LateDays = null;
        }
        public bool PickedUp { get; set; } = false;
        public bool BroughtBack { get; set; } = false;
        public int ReservationId { get; set; } // Primary Key
        public int CustomerId { get; set; } // FK to Customer
        public int VehicleId { get; set; } // FK to Vehicle
        public bool IsLate { get; set; } = false;       // ✅ NEW
        public int? LateDays { get; set; } = null;
        public DateTime StartDate { get; set; } // Pickup Date
        public DateTime EndDate { get; set; } // Return Date
        public ReservationStatus Status { get; set; } // Enum for better status control

        public DateTime CreatedAt { get; set; } // Auto-filled on creation
        public DateTime? UpdatedAt { get; set; } // Nullable, updates on modification

        // ✅ Navigation Properties
        public Customer Customer { get; set; } = null!; // ✅ Each Reservation has ONE Customer
        public Vehicle Vehicle { get; set; } = null!;   // ✅ Each Reservation has ONE Vehicle
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    // ✅ Enum for Reservation Status
    public enum ReservationStatus
    {
        Pending,
        Reserved,
        Conflict // ✅ Add this for handling reassignment issues
    }
}
