using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class Car : Vehicle
    {
        public Car(int vehicleId, string mark, string model, int year, decimal prepayFee, string fuelType, int seatingCapacity, bool isAvailable,
                   bool hasAirConditioning, bool hasNavigationSystem, int trunkCapacity, bool hasSunroof, string transmission)
            : base(vehicleId, mark, model, year, prepayFee, "Car", fuelType, seatingCapacity, isAvailable, transmission) // ✅ "Car" is automatically set
        {
            HasAirConditioning = hasAirConditioning;
            HasNavigationSystem = hasNavigationSystem;
            TrunkCapacity = trunkCapacity; // ✅ Cargo space in liters
            HasSunroof = hasSunroof;
        }

        public bool HasAirConditioning { get; set; } // ✅ Does the car have AC?
        public bool HasNavigationSystem { get; set; } // ✅ GPS Navigation System?
        public int TrunkCapacity { get; set; } // ✅ Trunk space in liters
        public bool HasSunroof { get; set; } // ✅ Sunroof availability
    }
}
