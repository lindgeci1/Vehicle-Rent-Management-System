using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class TripDetails
    {
        public TripDetails(int tripDetailsId, int vehicleId, int daysTaken, decimal distanceTraveled, decimal totalCost)
        {
            TripDetailsId = tripDetailsId;
            VehicleId = vehicleId;
            DaysTaken = daysTaken;
            DistanceTraveled = distanceTraveled;
            TotalCost = totalCost;
        }


        public int TripDetailsId { get; set; } // PK
        public int VehicleId { get; set; }     // FK to Vehicle

        public int DaysTaken { get; set; }     // ✅ Used to calculate TotalCost

        public decimal DistanceTraveled { get; set; }
        public decimal TotalCost { get; set; } // ✅ Based on DaysTaken * Vehicle.DailyRate or similar


        public Vehicle Vehicle { get; set; } = null!;
    }
}
