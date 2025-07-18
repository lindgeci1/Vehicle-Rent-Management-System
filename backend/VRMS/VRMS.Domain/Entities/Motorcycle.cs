using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class Motorcycle : Vehicle
    {
        public Motorcycle(int vehicleId, string mark, string model, int year, decimal prepayFee, string fuelType, int seatingCapacity, bool isAvailable,
                          bool hasSideCar, bool isElectric, bool hasABS, int maxSpeed, string transmission)
            : base(vehicleId, mark, model, year, prepayFee, "Motorcycle", fuelType, seatingCapacity, isAvailable, transmission) // ✅ "Motorcycle" is automatically set
        {
            HasSideCar = hasSideCar;
            IsElectric = isElectric;
            HasABS = hasABS; // ✅ Anti-lock Braking System
            MaxSpeed = maxSpeed; // ✅ Maximum Speed in km/h
        }

        public bool HasSideCar { get; set; } // ✅ Does it have a sidecar?
        public bool IsElectric { get; set; } // ✅ Is it electric?
        public bool HasABS { get; set; } // ✅ Anti-lock braking system available?
        public int MaxSpeed { get; set; } // ✅ Top speed in km/h
    }
}
