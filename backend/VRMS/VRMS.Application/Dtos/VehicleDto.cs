using VRMS.Domain.Entities;
using VRMS.Infrastructure.Migrations;

namespace VRMS.Application.Dtos
{
    public class VehicleDto
    {
        // Parameterless constructor for potential deserialization
        public VehicleDto() { }

        // Constructor that maps the Vehicle entity to the DTO
        public VehicleDto(Vehicle vehicle)
        {
            VehicleId = vehicle.VehicleId;
            Mark = vehicle.Mark;
            Model = vehicle.Model;
            Year = vehicle.Year;
            PrepayFee = vehicle.PrepayFee;
            Category = vehicle.Category;
            FuelType = vehicle.FuelType;
            SeatingCapacity = vehicle.SeatingCapacity;
            IsAvailable = vehicle.IsAvailable;
            CreatedAt = vehicle.CreatedAt;
            Transmission = vehicle.Transmission;
            foreach (var p in vehicle.Photos)
                Photos.Add(new PhotoDto { Url = p.Url, PublicId = p.PublicId });
        }

        public int VehicleId { get; set; }
        public string Mark { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Transmission { get; set; } = string.Empty;
        public decimal PrepayFee { get; set; }
        public string Category { get; set; } = string.Empty;
        public string FuelType { get; set; } = string.Empty;
        public int SeatingCapacity { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<PhotoDto> Photos { get; set; } = new List<PhotoDto>();
    }
}
