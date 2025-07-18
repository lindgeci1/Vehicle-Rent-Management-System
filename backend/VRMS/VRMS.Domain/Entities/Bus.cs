using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class Bus : Vehicle
    {
        public Bus(int vehicleId, string mark, string model, int year, decimal prepayFee, string fuelType, int seatingCapacity, bool isAvailable,
                   int numberOfDoors, bool hasLuggageCompartment, bool hasToilet, bool isDoubleDecker, string transmission)
            : base(vehicleId, mark, model, year, prepayFee, "Bus", fuelType, seatingCapacity, isAvailable, transmission) // ✅ "Bus" is automatically set
        {
            NumberOfDoors = numberOfDoors;
            HasLuggageCompartment = hasLuggageCompartment;
            HasToilet = hasToilet; // ✅ Onboard toilet availability
            IsDoubleDecker = isDoubleDecker; // ✅ Double-decker bus?
        }

        public int NumberOfDoors { get; set; } // ✅ Number of doors
        public bool HasLuggageCompartment { get; set; } // ✅ Has extra luggage space?
        public bool HasToilet { get; set; } // ✅ Is there an onboard toilet?
        public bool IsDoubleDecker { get; set; } // ✅ Double-decker bus?
    }
}
