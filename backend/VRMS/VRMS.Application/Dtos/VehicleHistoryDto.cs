using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Dtos
{
    public class VehicleHistoryDto
    {
        public VehicleHistoryDto() { }

        public VehicleHistoryDto(VehicleHistory vehicleHistory)
        {
            Id = vehicleHistory.Id;
            VehicleId = vehicleHistory.VehicleId;
            NumberOfDrivers = vehicleHistory.NumberOfDrivers;
            HasHadAccident = vehicleHistory.HasHadAccident;
            Km = vehicleHistory.Km;
            AccidentDescription = vehicleHistory.AccidentDescription;
            UpdatedAt = vehicleHistory.UpdatedAt;
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
