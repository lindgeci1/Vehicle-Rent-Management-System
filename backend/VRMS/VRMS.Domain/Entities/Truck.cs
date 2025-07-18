using System;

namespace VRMS.Domain.Entities
{
    public class Truck : Vehicle
    {
        public Truck(int vehicleId, string mark, string model, int year, decimal prepayFee, string fuelType, int seatingCapacity, bool isAvailable, double loadCapacity, string trailerType, bool hasSleepingCabin, string transmission)
            : base(vehicleId, mark, model, year, prepayFee, "Truck", fuelType, seatingCapacity, isAvailable, transmission)
        {
            LoadCapacity = loadCapacity;
            TrailerType = trailerType;
            HasSleepingCabin = hasSleepingCabin;
        }

        public double LoadCapacity { get; set; } // ✅ Maximum load in tons
        public string TrailerType { get; set; } // ✅ Flatbed, Refrigerated, etc.
        public bool HasSleepingCabin { get; set; } // ✅ Whether the truck has a cabin for the driver
    }
}
