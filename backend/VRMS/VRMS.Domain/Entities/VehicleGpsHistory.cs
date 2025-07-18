using System;

namespace VRMS.Domain.Entities
{
    public class VehicleGpsHistory
    {
        public int Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime Timestamp { get; set; }

        // Navigation
        public int VehicleId { get; set; }
        public Vehicle Vehicle { get; set; }
    }
}
