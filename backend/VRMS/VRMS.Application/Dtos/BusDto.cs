using VRMS.Domain.Entities;
using System.Collections.Generic;

namespace VRMS.Application.Dtos
{
    public class BusDto
    {
        // Parameterless constructor for potential deserialization
        public BusDto() { }

        // Constructor that maps the Bus entity to the DTO
        public BusDto(Bus bus)
        {
            // Common vehicle properties
            VehicleId = bus.VehicleId;
            Mark = bus.Mark;
            Model = bus.Model;
            Year = bus.Year;
            PrepayFee = bus.PrepayFee;
            FuelType = bus.FuelType;
            SeatingCapacity = bus.SeatingCapacity;
            IsAvailable = bus.IsAvailable;
            Transmission = bus.Transmission;

            // Bus-specific properties
            NumberOfDoors = bus.NumberOfDoors;
            HasLuggageCompartment = bus.HasLuggageCompartment;
            HasToilet = bus.HasToilet;
            IsDoubleDecker = bus.IsDoubleDecker;

            // Photos
            Photos = new List<PhotoDto>();
            foreach (var p in bus.Photos)
                Photos.Add(new PhotoDto { Url = p.Url, PublicId = p.PublicId });
        }

        // Common vehicle properties
        public int VehicleId { get; set; }
        public string Mark { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public decimal PrepayFee { get; set; }
        public string FuelType { get; set; }
        public int SeatingCapacity { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }

        // Bus-specific properties
        public int NumberOfDoors { get; set; }
        public bool HasLuggageCompartment { get; set; }
        public bool HasToilet { get; set; }
        public bool IsDoubleDecker { get; set; }

        public List<PhotoDto> Photos { get; set; } = new List<PhotoDto>();
    }
}
