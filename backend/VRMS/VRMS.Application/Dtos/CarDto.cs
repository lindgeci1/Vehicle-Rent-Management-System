using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class CarDto
    {
        // Parameterless constructor for potential deserialization
        public CarDto() { }

        // Constructor that maps the Car entity to the DTO
        public CarDto(Car car)
        {
            VehicleId = car.VehicleId;
            Mark = car.Mark;
            Model = car.Model;
            Year = car.Year;
            PrepayFee = car.PrepayFee;
            FuelType = car.FuelType;
            SeatingCapacity = car.SeatingCapacity;
            IsAvailable = car.IsAvailable;
            HasAirConditioning = car.HasAirConditioning;
            HasNavigationSystem = car.HasNavigationSystem;
            TrunkCapacity = car.TrunkCapacity;
            Transmission = car.Transmission;
            HasSunroof = car.HasSunroof;
            foreach (var p in car.Photos)
                Photos.Add(new PhotoDto { Url = p.Url, PublicId = p.PublicId });
        }

        // Properties inherited from Vehicle
        public int VehicleId { get; set; }
        public string Mark { get; set; }
        public string Model { get; set; }
        public int Year { get; set; }
        public decimal PrepayFee { get; set; }
        public string FuelType { get; set; }
        public int SeatingCapacity { get; set; }

        public string Transmission { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }

        // Properties specific to Car
        public bool HasAirConditioning { get; set; }
        public bool HasNavigationSystem { get; set; }
        public int TrunkCapacity { get; set; }
        public bool HasSunroof { get; set; }
        public List<PhotoDto> Photos { get; set; } = new List<PhotoDto>();
    }
}
