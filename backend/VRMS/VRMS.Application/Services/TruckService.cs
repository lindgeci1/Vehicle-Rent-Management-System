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
    public class TruckService : ITruckService
    {
        private readonly ITruckRepository _truckRepository;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository;
        private readonly IVehicleService _vehicleService;
        private readonly PriceService _priceService;

        public TruckService(
            ITruckRepository truckRepository,
            IVehicleHistoryRepository vehicleHistoryRepository,
            IVehiclePreConditionRepository vehiclePreConditionRepository,
            IVehiclePostConditionRepository vehiclePostConditionRepository,
            IVehicleService vehicleService,
            PriceService priceService)
        {
            _truckRepository = truckRepository;
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _vehiclePreConditionRepository = vehiclePreConditionRepository;
            _vehiclePostConditionRepository = vehiclePostConditionRepository;
            _vehicleService = vehicleService;
            _priceService = priceService;
        }

        /*──────────────────────────────*
         *  CREATE                      *
         *──────────────────────────────*/
        public async Task<TruckDto> CreateTruck(TruckDto dto)
        {
            // Basic validations
            if (string.IsNullOrWhiteSpace(dto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(dto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(dto.FuelType))
                throw new ArgumentException("FuelType is required.");
            if (dto.SeatingCapacity < 2 || dto.SeatingCapacity > 3)
                throw new ArgumentException("Seating capacity must be between 2 and 3.");
            if (dto.LoadCapacity <= 0)
                throw new ArgumentException("LoadCapacity must be greater than 0.");
            if (string.IsNullOrWhiteSpace(dto.TrailerType))
                throw new ArgumentException("TrailerType is required.");

            int currentYear = DateTime.Now.Year;
            if (dto.Year < 1980 || dto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1980 and {currentYear}.");

            var allowedFuelTypes = new[] { "Diesel", "Petrol", "Hybrid", "Electric" };
            if (!allowedFuelTypes.Contains(dto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(dto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            // Validate mark & model
            var truckModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Mercedes-Benz", new List<string> { "Actros", "Arocs", "Atego" } },
                { "Volvo",         new List<string> { "FH", "FMX", "FE" } },
                { "MAN",           new List<string> { "TGX", "TGS", "TGM" } },
                { "Scania",        new List<string> { "R-series", "S-series", "P-series" } },
                { "DAF",           new List<string> { "XF", "CF", "LF" } }
            };

            var normalizedMark = truckModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, dto.Mark, StringComparison.OrdinalIgnoreCase));
            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{dto.Mark}'. Available marks: {string.Join(", ", truckModelsByMark.Keys)}");

            var validModels = truckModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, dto.Model, StringComparison.OrdinalIgnoreCase));
            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{dto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            dto.Mark = normalizedMark;
            dto.Model = normalizedModel;

            // Calculate PrepayFee
            dto.PrepayFee = _priceService.CalculatePrepayFee("Truck", dto.Mark, dto.Year);

            var truck = new Truck(
                vehicleId: dto.VehicleId,
                mark: dto.Mark,
                model: dto.Model,
                year: dto.Year,
                prepayFee: dto.PrepayFee,
                fuelType: dto.FuelType,
                seatingCapacity: dto.SeatingCapacity,
                isAvailable: dto.IsAvailable,
                loadCapacity: dto.LoadCapacity,
                trailerType: dto.TrailerType,
                hasSleepingCabin: dto.HasSleepingCabin,
                transmission: dto.Transmission
            );

            await _truckRepository.AddTruck(truck);
            return new TruckDto(truck);
        }

        /*──────────────────────────────*
         *  READ / HELPERS              *
         *──────────────────────────────*/
        public IEnumerable<string> GetModelsByMark(string mark)
        {
            var truckModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Mercedes-Benz", new List<string> { "Actros", "Arocs", "Atego" } },
                { "Volvo",         new List<string> { "FH", "FMX", "FE" } },
                { "MAN",           new List<string> { "TGX", "TGS", "TGM" } },
                { "Scania",        new List<string> { "R-series", "S-series", "P-series" } },
                { "DAF",           new List<string> { "XF", "CF", "LF" } }
            };
            return truckModelsByMark.TryGetValue(mark, out var models) ? models : Enumerable.Empty<string>();
        }

        public async Task<TruckDto> GetTruckById(int truckId)
        {
            var truck = await _truckRepository.GetTruckById(truckId);
            return truck != null ? new TruckDto(truck) : null;
        }

        public async Task<IEnumerable<TruckDto>> GetAllTrucks()
        {
            var trucks = await _truckRepository.GetAllTrucks();
            return trucks.Select(t => new TruckDto(t));
        }

        public async Task<IEnumerable<TruckDto>> GetTrucksByFuelType(string fuelType)
        {
            var trucks = await _truckRepository.GetTrucksByFuelType(fuelType);
            return trucks.Select(t => new TruckDto(t));
        }

        public async Task<IEnumerable<TruckDto>> GetAvailableTrucks()
        {
            var trucks = await _truckRepository.GetAvailableTrucks();
            return trucks.Select(t => new TruckDto(t));
        }

        /*──────────────────────────────*
         *  UPDATE                      *
         *──────────────────────────────*/
        public async Task<TruckDto> UpdateTruck(TruckDto dto)
        {
            var existingTruck = await _truckRepository.GetTruckById(dto.VehicleId);
            if (existingTruck == null)
                throw new ArgumentException("Truck not found.");

            int currentYear = DateTime.Now.Year;
            if (dto.Year < 1980 || dto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1980 and {currentYear}.");
            if (dto.LoadCapacity <= 0)
                throw new ArgumentException("LoadCapacity must be greater than 0.");
            if (dto.SeatingCapacity < 2 || dto.SeatingCapacity > 3)
                throw new ArgumentException("Seating capacity must be between 2 and 3.");

            var allowedFuelTypes = new[] { "Diesel", "Petrol", "Hybrid", "Electric" };
            if (!allowedFuelTypes.Contains(dto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");
            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(dto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            var modelsForMark = GetModelsByMark(dto.Mark).ToList();
            if (!modelsForMark.Any())
                throw new ArgumentException($"Invalid mark '{dto.Mark}'.");
            if (!modelsForMark.Contains(dto.Model, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"Invalid model '{dto.Model}' for mark '{dto.Mark}'.");

            dto.PrepayFee = _priceService.CalculatePrepayFee("Truck", dto.Mark, dto.Year);

            existingTruck.Mark = dto.Mark;
            existingTruck.Model = dto.Model;
            existingTruck.Year = dto.Year;
            existingTruck.PrepayFee = dto.PrepayFee;
            existingTruck.FuelType = dto.FuelType;
            existingTruck.SeatingCapacity = dto.SeatingCapacity;
            existingTruck.IsAvailable = dto.IsAvailable;
            existingTruck.LoadCapacity = dto.LoadCapacity;
            existingTruck.TrailerType = dto.TrailerType;
            existingTruck.HasSleepingCabin = dto.HasSleepingCabin;
            existingTruck.Transmission = dto.Transmission;

            await _truckRepository.UpdateTruck(existingTruck);
            return new TruckDto(existingTruck);
        }

        /*──────────────────────────────*
         *  DELETE                      *
         *──────────────────────────────*/
        public async Task DeleteTruck(int truckId)
        {
            await _vehicleService.DeleteVehicle(truckId);
        }
    }
}
