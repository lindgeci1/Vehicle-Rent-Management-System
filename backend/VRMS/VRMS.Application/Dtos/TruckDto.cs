using VRMS.Domain.Entities;
using System.Collections.Generic;

namespace VRMS.Application.Dtos
{
    public class TruckDto
    {
        // Parameterless constructor for potential deserialization
        public TruckDto() { }

        // Constructor that maps the Truck entity to the DTO
        public TruckDto(Truck truck)
        {
            // Common vehicle properties
            VehicleId = truck.VehicleId;
            Mark = truck.Mark;
            Model = truck.Model;
            Year = truck.Year;
            PrepayFee = truck.PrepayFee;
            FuelType = truck.FuelType;
            SeatingCapacity = truck.SeatingCapacity;
            IsAvailable = truck.IsAvailable;
            Transmission = truck.Transmission;

            // Truck-specific properties
            LoadCapacity = truck.LoadCapacity;
            TrailerType = truck.TrailerType;
            HasSleepingCabin = truck.HasSleepingCabin;

            // Photos
            Photos = new List<PhotoDto>();
            foreach (var p in truck.Photos)
                Photos.Add(new PhotoDto { Url = p.Url, PublicId = p.PublicId });
        }

        /* ───────── Common vehicle properties ───────── */
        public int VehicleId { get; set; }
        public string Mark { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public decimal PrepayFee { get; set; }
        public string FuelType { get; set; }
        public int SeatingCapacity { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }

        /* ───────── Truck-specific properties ───────── */
        public double LoadCapacity { get; set; }
        public string TrailerType { get; set; }
        public bool HasSleepingCabin { get; set; }

        public List<PhotoDto> Photos { get; set; } = new List<PhotoDto>();
    }
}
