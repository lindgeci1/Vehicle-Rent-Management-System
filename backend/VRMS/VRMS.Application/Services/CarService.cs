using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System;
using VRMS.Application.Interface;
using VRMS.Infrastructure.Repositories;
using System.Runtime.ConstrainedExecution;

namespace VRMS.Application.Services
{
    public class CarService : ICarService
    {
        private readonly ICarRepository _carRepository;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository; // ✅ Injected
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository; // ✅ Injected
        private readonly IVehicleService _vehicleService;
        private readonly PriceService _priceService;
        public CarService(
            ICarRepository carRepository,
            IVehicleHistoryRepository vehicleHistoryRepository,
            IVehiclePreConditionRepository vehiclePreConditionRepository,
            IVehiclePostConditionRepository vehiclePostConditionRepository,
            IVehicleService vehicleService,
            PriceService priceService)
        {
            _carRepository = carRepository;
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _vehiclePreConditionRepository = vehiclePreConditionRepository;
            _vehiclePostConditionRepository = vehiclePostConditionRepository;
            _vehicleService = vehicleService;
            _priceService = priceService;
        }
        public async Task<CarDto> CreateCar(CarDto carDto)
        {
            if (string.IsNullOrWhiteSpace(carDto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(carDto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(carDto.FuelType))
                throw new ArgumentException("FuelType is required.");

            int currentYear = DateTime.Now.Year;
            if (carDto.Year < 1950 || carDto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");

            if (carDto.SeatingCapacity < 1 || carDto.SeatingCapacity > 10)
                throw new ArgumentException("Seating capacity must be between 1 and 10.");

            if (carDto.TrunkCapacity < 200 || carDto.TrunkCapacity > 500)
                throw new ArgumentException("Trunk capacity must be between 200 and 500 liters.");

            var allowedFuelTypes = new[] { "Petrol", "Diesel", "Electric", "Hybrid" };
            if (!allowedFuelTypes.Contains(carDto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            if (string.IsNullOrWhiteSpace(carDto.Transmission))
                throw new ArgumentException("Transmission is required.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(carDto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            var carModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
{
    { "Audi", new List<string> { "A1", "A3", "A4", "A5", "A6", "A7", "Q2", "Q3", "Q5", "Q7", "Q8" } },
    { "BMW", new List<string> { "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7" } },
    { "Mercedes", new List<string> { "A Class", "B Class", "C Class", "E Class", "S Class", "CLA", "GLA", "GLC", "GLE", "GLS" } },
    { "Honda", new List<string> { "Fit", "Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline" } },
    { "Toyota", new List<string> { "Yaris", "Corolla", "Camry", "Avalon", "RAV4", "Highlander", "C-HR", "4Runner", "Land Cruiser" } },
    { "Ford", new List<string> { "Fiesta", "Focus", "Fusion", "Mustang", "Escape", "Edge", "Explorer", "Expedition", "F-150" } }
};

            // Normalize mark
            var normalizedMark = carModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, carDto.Mark, StringComparison.OrdinalIgnoreCase));

            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{carDto.Mark}'. Available marks: {string.Join(", ", carModelsByMark.Keys)}");

            // Normalize model
            var validModels = carModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, carDto.Model, StringComparison.OrdinalIgnoreCase));

            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{carDto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            // ✅ Now assign normalized values
            carDto.Mark = normalizedMark;
            carDto.Model = normalizedModel;
            Console.WriteLine($"[DEBUG] Calculating PrepayFee:");
            Console.WriteLine($"  VehicleType: Car");
            Console.WriteLine($"  Mark: {carDto.Mark}");
            Console.WriteLine($"  Year: {carDto.Year}");
            // ✅ Calculate PrepayFee
            carDto.PrepayFee = _priceService.CalculatePrepayFee("Car", carDto.Mark, carDto.Year);
            Console.WriteLine($"  Resulting PrepayFee: {carDto.PrepayFee}");

            var car = new Car(
                vehicleId: carDto.VehicleId,
                mark: carDto.Mark,
                model: carDto.Model,
                year: carDto.Year,
                prepayFee: carDto.PrepayFee,
                fuelType: carDto.FuelType,
                seatingCapacity: carDto.SeatingCapacity,
                isAvailable: carDto.IsAvailable,
                hasAirConditioning: carDto.HasAirConditioning,
                hasNavigationSystem: carDto.HasNavigationSystem,
                trunkCapacity: carDto.TrunkCapacity,
                hasSunroof: carDto.HasSunroof,
                transmission: carDto.Transmission
            );

            await _carRepository.AddCar(car);
            return new CarDto(car);
        }

        //private decimal CalculatePrepayFee(string mark, string model, int year)
        //{
        //    const decimal baseFee = 50;
        //    decimal multiplier = mark switch
        //    {
        //        "Audi" => 1.2m,
        //        "BMW" => 1.3m,
        //        "Mercedes" => 1.4m,
        //        "Honda" => 1.0m,
        //        "Toyota" => 1.1m,
        //        "Ford" => 1.0m,
        //        _ => 1.0m
        //    };

        //    int currentYear = DateTime.Now.Year;
        //    int carAge = year > 0 ? (currentYear - year) : 0;
        //    decimal fee = baseFee * multiplier - (carAge * 0.5m);
        //    if (fee < baseFee)
        //        fee = baseFee;

        //    return Math.Round(fee, 2);
        //}

        public IEnumerable<string> GetModelsByMark(string mark)
        {
            var carModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase) // ✅ Case-insensitive dictionary
            {
                { "Audi", new List<string> { "A1", "A3", "A4", "A5", "A6", "A7", "Q2", "Q3", "Q5", "Q7", "Q8" } },
                { "BMW", new List<string> { "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7" } },
                { "Mercedes", new List<string> { "A Class", "B Class", "C Class", "E Class", "S Class", "CLA", "GLA", "GLC", "GLE", "GLS" } },
                { "Honda", new List<string> { "Fit", "Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline" } },
                { "Toyota", new List<string> { "Yaris", "Corolla", "Camry", "Avalon", "RAV4", "Highlander", "C-HR", "4Runner", "Land Cruiser" } },
                { "Ford", new List<string> { "Fiesta", "Focus", "Fusion", "Mustang", "Escape", "Edge", "Explorer", "Expedition", "F-150" } }
            };

            if (carModelsByMark.TryGetValue(mark, out var models))
            {
                return models;
            }

            return Enumerable.Empty<string>();
        }

        public async Task<CarDto> UpdateCar(CarDto carDto)
        {
            if (string.IsNullOrWhiteSpace(carDto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(carDto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(carDto.FuelType))
                throw new ArgumentException("FuelType is required.");

            int currentYear = DateTime.Now.Year;
            if (carDto.Year < 1950 || carDto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");

            if (carDto.SeatingCapacity < 1 || carDto.SeatingCapacity > 10)
                throw new ArgumentException("Seating capacity must be between 1 and 10.");

            var existingCar = await _carRepository.GetCarById(carDto.VehicleId);
            if (existingCar == null)
                throw new ArgumentException("Car not found.");

            if (carDto.TrunkCapacity < 200 || carDto.TrunkCapacity > 500)
                throw new ArgumentException("Trunk capacity must be between 200 and 500 liters.");

            var allowedFuelTypes = new[] { "Petrol", "Diesel", "Electric", "Hybrid" };
            if (!allowedFuelTypes.Contains(carDto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            if (string.IsNullOrWhiteSpace(carDto.Transmission))
                throw new ArgumentException("Transmission is required.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(carDto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            var carModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Audi", new List<string> { "A1", "A3", "A4", "A5", "A6", "A7", "Q2", "Q3", "Q5", "Q7", "Q8" } },
                { "BMW", new List<string> { "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X6", "X7" } },
                { "Mercedes", new List<string> { "A Class", "B Class", "C Class", "E Class", "S Class", "CLA", "GLA", "GLC", "GLE", "GLS" } },
                { "Honda", new List<string> { "Fit", "Civic", "Accord", "CR-V", "Pilot", "HR-V", "Odyssey", "Ridgeline" } },
                { "Toyota", new List<string> { "Yaris", "Corolla", "Camry", "Avalon", "RAV4", "Highlander", "C-HR", "4Runner", "Land Cruiser" } },
                { "Ford", new List<string> { "Fiesta", "Focus", "Fusion", "Mustang", "Escape", "Edge", "Explorer", "Expedition", "F-150" } }
            };

            // Normalize mark
            var normalizedMark = carModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, carDto.Mark, StringComparison.OrdinalIgnoreCase));

            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{carDto.Mark}'. Available marks: {string.Join(", ", carModelsByMark.Keys)}");

            // Normalize model
            var validModels = carModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, carDto.Model, StringComparison.OrdinalIgnoreCase));

            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{carDto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            // ✅ Now assign normalized values
            carDto.Mark = normalizedMark;
            carDto.Model = normalizedModel;

            // ✅ Calculate PrepayFee
            carDto.PrepayFee = _priceService.CalculatePrepayFee("Car", carDto.Mark, carDto.Year);

            // Update properties
            existingCar.Mark = carDto.Mark;
            existingCar.Model = carDto.Model;
            existingCar.Year = carDto.Year;
            existingCar.PrepayFee = carDto.PrepayFee;
            existingCar.FuelType = carDto.FuelType;
            existingCar.SeatingCapacity = carDto.SeatingCapacity;
            existingCar.IsAvailable = carDto.IsAvailable;
            existingCar.HasAirConditioning = carDto.HasAirConditioning;
            existingCar.HasNavigationSystem = carDto.HasNavigationSystem;
            existingCar.TrunkCapacity = carDto.TrunkCapacity;
            existingCar.HasSunroof = carDto.HasSunroof;
            existingCar.Transmission = carDto.Transmission;

            await _carRepository.UpdateCar(existingCar);
            return new CarDto(existingCar);
        }

        public async Task<CarDto> GetCarById(int carId)
        {
            var car = await _carRepository.GetCarById(carId);
            return car != null ? new CarDto(car) : null;
        }

        public async Task DeleteCar(int carId)
        {

            await _vehicleService.DeleteVehicle(carId);
        }

        public async Task<IEnumerable<CarDto>> GetAllCars()
        {
            var cars = await _carRepository.GetAllCars();
            return cars.Select(c => new CarDto(c));
        }

        public async Task<IEnumerable<CarDto>> GetCarsByFuelType(string fuelType)
        {
            var cars = await _carRepository.GetCarsByFuelType(fuelType);
            return cars.Select(c => new CarDto(c));
        }

        public async Task<IEnumerable<CarDto>> GetAvailableCars()
        {
            var cars = await _carRepository.GetAvailableCars();
            return cars.Select(c => new CarDto(c));
        }
    }
}
