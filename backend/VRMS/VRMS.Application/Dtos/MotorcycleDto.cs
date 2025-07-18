using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class MotorcycleDto
    {
        // Parameterless constructor for potential deserialization
        public MotorcycleDto() { }

        // Constructor that maps the Motorcycle entity to the DTO
        public MotorcycleDto(Motorcycle motorcycle)
        {
            VehicleId = motorcycle.VehicleId;
            Mark = motorcycle.Mark;
            Model = motorcycle.Model;
            Year = motorcycle.Year;
            PrepayFee = motorcycle.PrepayFee;
            FuelType = motorcycle.FuelType;
            SeatingCapacity = motorcycle.SeatingCapacity;
            IsAvailable = motorcycle.IsAvailable;

            HasSideCar = motorcycle.HasSideCar;
            IsElectric = motorcycle.IsElectric;
            HasABS = motorcycle.HasABS;
            MaxSpeed = motorcycle.MaxSpeed;
            Transmission = motorcycle.Transmission;

            Photos = new List<PhotoDto>();
            foreach (var p in motorcycle.Photos)
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
        public bool IsAvailable { get; set; }
        public string Transmission { get; set; } = string.Empty;

        // Motorcycle-specific properties
        public bool HasSideCar { get; set; }
        public bool IsElectric { get; set; }
        public bool HasABS { get; set; }
        public int MaxSpeed { get; set; }

        public List<PhotoDto> Photos { get; set; } = new List<PhotoDto>();
    }
}
