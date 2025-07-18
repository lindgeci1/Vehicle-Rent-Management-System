using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Application.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VRMS.Application.Services
{
    public class MotorcycleService : IMotorcycleService
    {
        private readonly IMotorcycleRepository _motorcycleRepository;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository;
        private readonly IVehicleService _vehicleService;
        private readonly PriceService _priceService;

        public MotorcycleService(
            IMotorcycleRepository motorcycleRepository,
            IVehicleHistoryRepository vehicleHistoryRepository,
            IVehiclePreConditionRepository vehiclePreConditionRepository,
            IVehiclePostConditionRepository vehiclePostConditionRepository,
            IVehicleService vehicleService,
            PriceService priceService)
        {
            _motorcycleRepository = motorcycleRepository;
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _vehiclePreConditionRepository = vehiclePreConditionRepository;
            _vehiclePostConditionRepository = vehiclePostConditionRepository;
            _vehicleService = vehicleService;
            _priceService = priceService;
        }

        public async Task<MotorcycleDto> CreateMotorcycle(MotorcycleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(dto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(dto.FuelType))
                throw new ArgumentException("FuelType is required.");
            if (string.IsNullOrWhiteSpace(dto.Transmission))
                throw new ArgumentException("Transmission is required.");

            int currentYear = DateTime.Now.Year;
            if (dto.Year < 1950 || dto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");

            if (dto.SeatingCapacity < 1 || dto.SeatingCapacity > 4)
                throw new ArgumentException("Seating capacity must be between 1 and 4.");

            var allowedFuelTypes = new[] { "Petrol", "Diesel", "Electric", "Hybrid" };
            if (!allowedFuelTypes.Contains(dto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(dto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            var motorcycleModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Harley-Davidson", new List<string> { "Sportster", "Softail", "Touring", "Street", "V-Rod" } },
                { "Yamaha", new List<string> { "MT-07", "R1", "FZ-09", "YZF-R6", "Tracer 900" } },
                { "Kawasaki", new List<string> { "Ninja 400", "Versys 650", "Z900", "Vulcan S", "KLR 650" } },
                { "Honda", new List<string> { "CB500F", "CRF1000L Africa Twin", "Rebel 500", "CBR1000RR", "CBR500R" } },
                { "Suzuki", new List<string> { "GSX-R1000", "SV650", "V-Strom 650", "Hayabusa", "GSX-S750" } },
                { "Ducati", new List<string> { "Panigale V2", "Monster", "Multistrada", "Diavel", "Hypermotard" } }
            };

            // Normalize mark and model
            var normalizedMark = motorcycleModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, dto.Mark, StringComparison.OrdinalIgnoreCase));

            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{dto.Mark}'. Available marks: {string.Join(", ", motorcycleModelsByMark.Keys)}");

            var validModels = motorcycleModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, dto.Model, StringComparison.OrdinalIgnoreCase));

            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{dto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            dto.Mark = normalizedMark;
            dto.Model = normalizedModel;

            // ✅ Calculate PrepayFee using centralized service
            dto.PrepayFee = _priceService.CalculatePrepayFee("Motorcycle", dto.Mark, dto.Year);

            var motorcycle = new Motorcycle(
                vehicleId: dto.VehicleId,
                mark: dto.Mark,
                model: dto.Model,
                year: dto.Year,
                prepayFee: dto.PrepayFee,
                fuelType: dto.FuelType,
                seatingCapacity: dto.SeatingCapacity,
                isAvailable: dto.IsAvailable,
                hasSideCar: dto.HasSideCar,
                isElectric: dto.IsElectric,
                hasABS: dto.HasABS,
                maxSpeed: dto.MaxSpeed,
                transmission: dto.Transmission
            );

            await _motorcycleRepository.AddMotorcycle(motorcycle);
            return new MotorcycleDto(motorcycle);
        }


        public IEnumerable<string> GetModelsByMark(string mark)
        {
            var motorcycleModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
         {
        { "Harley-Davidson", new List<string> { "Sportster", "Softail", "Touring", "Street", "V-Rod" } },
        { "Yamaha", new List<string> { "MT-07", "R1", "FZ-09", "YZF-R6", "Tracer 900" } },
        { "Kawasaki", new List<string> { "Ninja 400", "Versys 650", "Z900", "Vulcan S", "KLR 650" } },
        { "Honda", new List<string> { "CB500F", "CRF1000L Africa Twin", "Rebel 500", "CBR1000RR", "CBR500R" } },
        { "Suzuki", new List<string> { "GSX-R1000", "SV650", "V-Strom 650", "Hayabusa", "GSX-S750" } },
        { "Ducati", new List<string> { "Panigale V2", "Monster", "Multistrada", "Diavel", "Hypermotard" } }
            };

            if (motorcycleModelsByMark.TryGetValue(mark, out var models))
            {
                return models;
            }

            return Enumerable.Empty<string>();
        }

        public async Task<MotorcycleDto> UpdateMotorcycle(MotorcycleDto motorcycleDto)
        {
            if (string.IsNullOrWhiteSpace(motorcycleDto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(motorcycleDto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(motorcycleDto.FuelType))
                throw new ArgumentException("FuelType is required.");

            int currentYear = DateTime.Now.Year;
            if (motorcycleDto.Year < 1950 || motorcycleDto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");

            if (motorcycleDto.SeatingCapacity < 1 || motorcycleDto.SeatingCapacity > 2)
                throw new ArgumentException("Seating capacity must be 1 or 2 for motorcycles.");

            if (motorcycleDto.MaxSpeed < 50 || motorcycleDto.MaxSpeed > 350)
                throw new ArgumentException("Max speed must be between 50 and 350 km/h.");

            var existingMotorcycle = await _motorcycleRepository.GetMotorcycleById(motorcycleDto.VehicleId);
            if (existingMotorcycle == null)
                throw new ArgumentException("Motorcycle not found.");

            var allowedFuelTypes = new[] { "Petrol", "Diesel", "Electric", "Hybrid" };
            if (!allowedFuelTypes.Contains(motorcycleDto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            if (string.IsNullOrWhiteSpace(motorcycleDto.Transmission))
                throw new ArgumentException("Transmission is required.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(motorcycleDto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            var motorcycleModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
    {
        { "Harley-Davidson", new List<string> { "Sportster", "Softail", "Touring", "Street", "V-Rod" } },
        { "Yamaha", new List<string> { "MT-07", "R1", "FZ-09", "YZF-R6", "Tracer 900" } },
        { "Kawasaki", new List<string> { "Ninja 400", "Versys 650", "Z900", "Vulcan S", "KLR 650" } },
        { "Honda", new List<string> { "CB500F", "CRF1000L Africa Twin", "Rebel 500", "CBR1000RR", "CBR500R" } },
        { "Suzuki", new List<string> { "GSX-R1000", "SV650", "V-Strom 650", "Hayabusa", "GSX-S750" } },
        { "Ducati", new List<string> { "Panigale V2", "Monster", "Multistrada", "Diavel", "Hypermotard" } }
    };

            var normalizedMark = motorcycleModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, motorcycleDto.Mark, StringComparison.OrdinalIgnoreCase));

            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{motorcycleDto.Mark}'. Available marks: {string.Join(", ", motorcycleModelsByMark.Keys)}");

            var validModels = motorcycleModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, motorcycleDto.Model, StringComparison.OrdinalIgnoreCase));

            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{motorcycleDto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            motorcycleDto.Mark = normalizedMark;
            motorcycleDto.Model = normalizedModel;

            motorcycleDto.PrepayFee = _priceService.CalculatePrepayFee("Motorcycle", motorcycleDto.Mark, motorcycleDto.Year);

            existingMotorcycle.Mark = motorcycleDto.Mark;
            existingMotorcycle.Model = motorcycleDto.Model;
            existingMotorcycle.Year = motorcycleDto.Year;
            existingMotorcycle.PrepayFee = motorcycleDto.PrepayFee;
            existingMotorcycle.FuelType = motorcycleDto.FuelType;
            existingMotorcycle.SeatingCapacity = motorcycleDto.SeatingCapacity;
            existingMotorcycle.IsAvailable = motorcycleDto.IsAvailable;
            existingMotorcycle.HasSideCar = motorcycleDto.HasSideCar;
            existingMotorcycle.IsElectric = motorcycleDto.IsElectric;
            existingMotorcycle.HasABS = motorcycleDto.HasABS;
            existingMotorcycle.MaxSpeed = motorcycleDto.MaxSpeed;
            existingMotorcycle.Transmission = motorcycleDto.Transmission;

            await _motorcycleRepository.UpdateMotorcycle(existingMotorcycle);
            return new MotorcycleDto(existingMotorcycle);
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

        public async Task<MotorcycleDto> GetMotorcycleById(int motorcycleId)
        {
            var motorcycle = await _motorcycleRepository.GetMotorcycleById(motorcycleId);
            return motorcycle != null ? new MotorcycleDto(motorcycle) : null;
        }

        public async Task DeleteMotorcycle(int motorcycleId)
        {
            await _vehicleService.DeleteVehicle(motorcycleId);
        }

        public async Task<IEnumerable<MotorcycleDto>> GetAllMotorcycles()
        {
            var motorcycles = await _motorcycleRepository.GetAllMotorcycles();
            return motorcycles.Select(m => new MotorcycleDto(m));
        }

        public async Task<IEnumerable<MotorcycleDto>> GetMotorcyclesByFuelType(string fuelType)
        {
            var motorcycles = await _motorcycleRepository.GetMotorcyclesByFuelType(fuelType);
            return motorcycles.Select(m => new MotorcycleDto(m));
        }

        public async Task<IEnumerable<MotorcycleDto>> GetAvailableMotorcycles()
        {
            var motorcycles = await _motorcycleRepository.GetAvailableMotorcycles();
            return motorcycles.Select(m => new MotorcycleDto(m));
        }

    }
}