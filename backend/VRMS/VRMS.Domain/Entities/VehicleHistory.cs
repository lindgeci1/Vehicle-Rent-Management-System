using System;

namespace VRMS.Domain.Entities
{
    public class VehicleHistory
    {
        public VehicleHistory(Guid id, int vehicleId, int numberOfDrivers, bool hasHadAccident, double km, string? accidentDescription = null)
        {
            Id = id;
            VehicleId = vehicleId;
            NumberOfDrivers = numberOfDrivers;
            HasHadAccident = hasHadAccident;
            Km = km;
            AccidentDescription = accidentDescription;
            UpdatedAt = DateTime.UtcNow;
        }

        public Guid Id { get; set; }
        public int VehicleId { get; set; }
        public int NumberOfDrivers { get; set; }
        public bool HasHadAccident { get; set; }
        public double Km { get; set; }
        public string? AccidentDescription { get; set; } // ✅ New nullable field
        public DateTime UpdatedAt { get; set; }
    }
}
