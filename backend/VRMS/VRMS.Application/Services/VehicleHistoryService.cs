using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class VehicleHistoryService : IVehicleHistoryService
    {
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        private readonly VRMSDbContext _dbContext;

        public VehicleHistoryService(IVehicleHistoryRepository vehicleHistoryRepository, VRMSDbContext dbContext)
        {
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _dbContext = dbContext;
        }
        public async Task<VehicleHistoryDto> CreateVehicleHistory(VehicleHistoryDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle history data cannot be null.");
            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");
            if (dto.Km < 0)
                throw new ArgumentException("Km cannot be negative.");
            if (dto.NumberOfDrivers < 0)
                throw new ArgumentException("Number of drivers cannot be negative.");

            if (dto.HasHadAccident && string.IsNullOrWhiteSpace(dto.AccidentDescription))
                throw new ArgumentException("Accident description is required if the vehicle had an accident.");

            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);

            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            var existing = await _vehicleHistoryRepository
                .GetVehicleHistoryByVehicleId(dto.VehicleId);

            if (existing != null)
                throw new ArgumentException("VehicleHistory for this vehicle already exists.");

            var vehicleHistory = new VehicleHistory(
                Guid.NewGuid(),
                dto.VehicleId,
                dto.NumberOfDrivers,
                dto.HasHadAccident,
                dto.Km,
                dto.HasHadAccident ? dto.AccidentDescription : null // ✅ only set if true
            );

            await _vehicleHistoryRepository.InsertVehicleHistory(vehicleHistory);
            return new VehicleHistoryDto(vehicleHistory); // ✅ return the DTO
        }


        public async Task<List<VehicleHistoryDto>> GetAllVehicleHistories()
        {
            var histories = await _vehicleHistoryRepository.GetAllVehicleHistories();
            return histories.Select(vh => new VehicleHistoryDto(vh)).ToList();
        }

        public async Task<VehicleHistoryDto> GetVehicleHistoryById(Guid id)
        {
            var vh = await _vehicleHistoryRepository.GetVehicleHistoryById(id);
            return vh == null ? null : new VehicleHistoryDto(vh);
        }

        public async Task<VehicleHistoryDto> UpdateVehicleHistory(VehicleHistoryDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle history data cannot be null.");
            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");
            if (dto.Km < 0)
                throw new ArgumentException("Km cannot be negative.");
            if (dto.NumberOfDrivers < 0)
                throw new ArgumentException("Number of drivers cannot be negative.");

            var existing = await _vehicleHistoryRepository.GetVehicleHistoryById(dto.Id);
            if (existing == null)
                throw new ArgumentException("Vehicle history not found.");

            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);

            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            var conflict = await _vehicleHistoryRepository.GetVehicleHistoryByVehicleId(dto.VehicleId);
            if (conflict != null && conflict.Id != dto.Id)
                throw new ArgumentException("Another VehicleHistory with this VehicleId already exists.");

            // ✅ Enforce accident description logic
            string accidentDescription = dto.HasHadAccident
                ? (!string.IsNullOrWhiteSpace(dto.AccidentDescription)
                    ? dto.AccidentDescription
                    : throw new ArgumentException("Accident description is required if HasHadAccident is true."))
                : null;

            var updated = new VehicleHistory(
                dto.Id,
                dto.VehicleId,
                dto.NumberOfDrivers,
                dto.HasHadAccident,
                dto.Km,
                accidentDescription
            );

            await _vehicleHistoryRepository.UpdateVehicleHistory(updated);
            return new VehicleHistoryDto(updated); // ✅ return the DTO
        }

        public async Task DeleteVehicleHistory(Guid id)
        {
            var existing = await _vehicleHistoryRepository.GetVehicleHistoryById(id);
            if (existing == null)
                throw new ArgumentException("Vehicle history not found.");

            await _vehicleHistoryRepository.DeleteVehicleHistory(id);
        }

        public async Task<VehicleHistoryDto> GetVehicleHistoryByVehicleId(int vehicleId)
        {
            var vh = await _vehicleHistoryRepository.GetVehicleHistoryByVehicleId(vehicleId);
            return vh == null ? null : new VehicleHistoryDto(vh);
        }

    }
}
