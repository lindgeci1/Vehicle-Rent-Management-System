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
    public class BusService : IBusService
    {
        private readonly IBusRepository _busRepository;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository;
        private readonly IVehicleService _vehicleService;
        private readonly PriceService _priceService;

        public BusService(
            IBusRepository busRepository,
            IVehicleHistoryRepository vehicleHistoryRepository,
            IVehiclePreConditionRepository vehiclePreConditionRepository,
            IVehiclePostConditionRepository vehiclePostConditionRepository,
            IVehicleService vehicleService,
            PriceService priceService)
        {
            _busRepository = busRepository;
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _vehiclePreConditionRepository = vehiclePreConditionRepository;
            _vehiclePostConditionRepository = vehiclePostConditionRepository;
            _vehicleService = vehicleService;
            _priceService = priceService;
        }

        /*───────────────────────────────*
         *  CREATE                       *
         *───────────────────────────────*/
        public async Task<BusDto> CreateBus(BusDto dto)
        {
            // ── Basic validations ─────────────────────────────
            if (string.IsNullOrWhiteSpace(dto.Mark))
                throw new ArgumentException("Mark is required.");
            if (string.IsNullOrWhiteSpace(dto.Model))
                throw new ArgumentException("Model is required.");
            if (string.IsNullOrWhiteSpace(dto.FuelType))
                throw new ArgumentException("FuelType is required.");
            if (dto.NumberOfDoors < 1 || dto.NumberOfDoors > 4)
                throw new ArgumentException("Number of doors must be between 1 and 4.");
            if (dto.SeatingCapacity < 10 || dto.SeatingCapacity > 80)
                throw new ArgumentException("Seating capacity must be between 10 and 80.");

            int currentYear = DateTime.Now.Year;
            if (dto.Year < 1950 || dto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");

            var allowedFuelTypes = new[] { "Diesel", "Petrol", "Hybrid", "Electric" };
            if (!allowedFuelTypes.Contains(dto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");

            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(dto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            // ── Validate mark & model ─────────────────────────
            var busModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Mercedes-Benz", new List<string> { "Tourismo", "Citaro", "Intouro" } },
                { "Volvo",        new List<string> { "9700", "7900", "9900" } },
                { "MAN",          new List<string> { "Lion's Coach", "Lion's City" } },
                { "Setra",        new List<string> { "S 531 DT", "S 515 HD", "S 517 HD" } },
                { "Neoplan",      new List<string> { "Skyliner", "Cityliner" } }
            };

            var normalizedMark = busModelsByMark.Keys
                .FirstOrDefault(m => string.Equals(m, dto.Mark, StringComparison.OrdinalIgnoreCase));
            if (normalizedMark == null)
                throw new ArgumentException($"Invalid mark '{dto.Mark}'. Available marks: {string.Join(", ", busModelsByMark.Keys)}");

            var validModels = busModelsByMark[normalizedMark];
            var normalizedModel = validModels
                .FirstOrDefault(m => string.Equals(m, dto.Model, StringComparison.OrdinalIgnoreCase));
            if (normalizedModel == null)
                throw new ArgumentException($"Invalid model '{dto.Model}' for mark '{normalizedMark}'. Available models: {string.Join(", ", validModels)}");

            dto.Mark = normalizedMark;
            dto.Model = normalizedModel;

            // ── Calculate PrepayFee via central service ───────
            dto.PrepayFee = _priceService.CalculatePrepayFee("Bus", dto.Mark, dto.Year);

            var bus = new Bus(
                vehicleId: dto.VehicleId,
                mark: dto.Mark,
                model: dto.Model,
                year: dto.Year,
                prepayFee: dto.PrepayFee,
                fuelType: dto.FuelType,
                seatingCapacity: dto.SeatingCapacity,
                isAvailable: dto.IsAvailable,
                numberOfDoors: dto.NumberOfDoors,
                hasLuggageCompartment: dto.HasLuggageCompartment,
                hasToilet: dto.HasToilet,
                isDoubleDecker: dto.IsDoubleDecker,
                transmission: dto.Transmission
            );

            await _busRepository.AddBus(bus);
            return new BusDto(bus);
        }

        /*───────────────────────────────*
         *  READ / HELPERS               *
         *───────────────────────────────*/
        public IEnumerable<string> GetModelsByMark(string mark)
        {
            var busModelsByMark = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
            {
                { "Mercedes-Benz", new List<string> { "Tourismo", "Citaro", "Intouro" } },
                { "Volvo",        new List<string> { "9700", "7900", "9900" } },
                { "MAN",          new List<string> { "Lion's Coach", "Lion's City" } },
                { "Setra",        new List<string> { "S 531 DT", "S 515 HD", "S 517 HD" } },
                { "Neoplan",      new List<string> { "Skyliner", "Cityliner" } }
            };
            return busModelsByMark.TryGetValue(mark, out var models) ? models : Enumerable.Empty<string>();
        }

        public async Task<BusDto> GetBusById(int busId)
        {
            var bus = await _busRepository.GetBusById(busId);
            return bus != null ? new BusDto(bus) : null;
        }

        public async Task<IEnumerable<BusDto>> GetAllBuses()
        {
            var buses = await _busRepository.GetAllBuses();
            return buses.Select(b => new BusDto(b));
        }

        public async Task<IEnumerable<BusDto>> GetBusesByFuelType(string fuelType)
        {
            var buses = await _busRepository.GetBusesByFuelType(fuelType);
            return buses.Select(b => new BusDto(b));
        }

        public async Task<IEnumerable<BusDto>> GetAvailableBuses()
        {
            var buses = await _busRepository.GetAvailableBuses();
            return buses.Select(b => new BusDto(b));
        }

        /*───────────────────────────────*
         *  UPDATE                       *
         *───────────────────────────────*/
        public async Task<BusDto> UpdateBus(BusDto dto)
        {
            var existingBus = await _busRepository.GetBusById(dto.VehicleId);
            if (existingBus == null)
                throw new ArgumentException("Bus not found.");

            // Re-use create-time validations
            dto.Mark ??= existingBus.Mark;
            dto.Model ??= existingBus.Model;

            // basic year / door / capacity validation
            int currentYear = DateTime.Now.Year;
            if (dto.Year < 1950 || dto.Year > currentYear)
                throw new ArgumentException($"Year must be between 1950 and {currentYear}.");
            if (dto.NumberOfDoors < 1 || dto.NumberOfDoors > 4)
                throw new ArgumentException("Number of doors must be between 1 and 4.");
            if (dto.SeatingCapacity < 10 || dto.SeatingCapacity > 80)
                throw new ArgumentException("Seating capacity must be between 10 and 80.");

            // (Re-)validate mark + model
            var modelsForMark = GetModelsByMark(dto.Mark).ToList();
            if (!modelsForMark.Any())
                throw new ArgumentException($"Invalid mark '{dto.Mark}'.");
            if (!modelsForMark.Contains(dto.Model, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"Invalid model '{dto.Model}' for mark '{dto.Mark}'.");

            // Fuel + transmission again
            var allowedFuelTypes = new[] { "Diesel", "Petrol", "Hybrid", "Electric" };
            if (!allowedFuelTypes.Contains(dto.FuelType, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException($"FuelType must be one of: {string.Join(", ", allowedFuelTypes)}.");
            var allowedTransmissions = new[] { "Automatic", "Manual" };
            if (!allowedTransmissions.Contains(dto.Transmission, StringComparer.OrdinalIgnoreCase))
                throw new ArgumentException("Transmission must be either 'Automatic' or 'Manual'.");

            // Recalculate prepay fee
            dto.PrepayFee = _priceService.CalculatePrepayFee("Bus", dto.Mark, dto.Year);

            // Map changes
            existingBus.Mark = dto.Mark;
            existingBus.Model = dto.Model;
            existingBus.Year = dto.Year;
            existingBus.PrepayFee = dto.PrepayFee;
            existingBus.FuelType = dto.FuelType;
            existingBus.SeatingCapacity = dto.SeatingCapacity;
            existingBus.IsAvailable = dto.IsAvailable;
            existingBus.NumberOfDoors = dto.NumberOfDoors;
            existingBus.HasLuggageCompartment = dto.HasLuggageCompartment;
            existingBus.HasToilet = dto.HasToilet;
            existingBus.IsDoubleDecker = dto.IsDoubleDecker;
            existingBus.Transmission = dto.Transmission;

            await _busRepository.UpdateBus(existingBus);
            return new BusDto(existingBus);
        }

        /*───────────────────────────────*
         *  DELETE                       *
         *───────────────────────────────*/
        public async Task DeleteBus(int busId)
        {
            await _vehicleService.DeleteVehicle(busId);   // cascades through history & conditions
        }
    }
}
