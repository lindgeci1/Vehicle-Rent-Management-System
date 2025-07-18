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
    public class VehiclePreConditionService : IVehiclePreConditionService
    {
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly VRMSDbContext _dbContext;
        private readonly IVehicleRepository _vehicleRepo;
        private readonly ICustomerRepository _customerRepo;
        private readonly IReservationRepository _reservationRepo;
        public VehiclePreConditionService(IVehiclePreConditionRepository repository, VRMSDbContext dbContext, IVehicleRepository vehicleRepo, IReservationRepository reservationRepo, ICustomerRepository customerRepo)
        {
            _vehiclePreConditionRepository = repository;
            _dbContext = dbContext;
            _vehicleRepo = vehicleRepo;
            _reservationRepo = reservationRepo;
            _customerRepo = customerRepo;
        }

        // CreateVehiclePreCondition now takes a DTO without PDF and returns a DTO including it
        public async Task<VehiclePreConditionDto> CreateVehiclePreCondition(
                    CreateVehiclePreConditionRequestDto request)
        {
            if (request.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");

            // 1) Verify vehicle exists in SQL
            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == request.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            // 2) Prevent duplicate
            var existing = await _vehiclePreConditionRepository
                .GetVehiclePreConditionByVehicleId(request.VehicleId);
            if (existing != null)
                throw new ArgumentException("VehiclePreCondition for this vehicle already exists.");

            // 3) Validate/clear descriptions
            if (request.HasScratches &&
                (string.IsNullOrWhiteSpace(request.ScratchDescription) ||
                 !request.ScratchDescription.Any(char.IsLetter)))
            {
                throw new ArgumentException("Scratch description must contain letters when HasScratches is true.");
            }
            if (!request.HasScratches) request.ScratchDescription = null;

            if (request.HasDents &&
                (string.IsNullOrWhiteSpace(request.DentDescription) ||
                 !request.DentDescription.Any(char.IsLetter)))
            {
                throw new ArgumentException("Dent description must contain letters when HasDents is true.");
            }
            if (!request.HasDents) request.DentDescription = null;

            if (request.HasRust &&
                (string.IsNullOrWhiteSpace(request.RustDescription) ||
                 !request.RustDescription.Any(char.IsLetter)))
            {
                throw new ArgumentException("Rust description must contain letters when HasRust is true.");
            }
            if (!request.HasRust) request.RustDescription = null;

            // 4) Generate new Id & timestamp
            var newId = Guid.NewGuid();
            var createdAt = DateTime.UtcNow;

            // 5) Fetch Vehicle entity (for PDF header if needed)
            var vehicleEntity = await _vehicleRepo.GetVehicleById(request.VehicleId);
            if (vehicleEntity == null)
                throw new ArgumentException($"Vehicle with ID {request.VehicleId} not found.");

            // 6) Build a “temp” domain object (PDF placeholder)
            var temp = new VehiclePreCondition(
                id: newId,
                vehicleId: request.VehicleId,
                hasScratches: request.HasScratches,
                scratchDescription: request.ScratchDescription,
                hasDents: request.HasDents,
                dentDescription: request.DentDescription,
                hasRust: request.HasRust,
                rustDescription: request.RustDescription,
                preConditionPdf: Array.Empty<byte>()  // placeholder
            );
            temp.CreatedAt = createdAt;

            // 7) Generate PDF bytes from “temp”
            byte[] pdfBytes = PreConditionPdfGenerator.Generate(temp);

            // 8) Build the final domain object with PDF embedded
            var finalEntity = new VehiclePreCondition(
                id: newId,
                vehicleId: request.VehicleId,
                hasScratches: request.HasScratches,
                scratchDescription: request.ScratchDescription,
                hasDents: request.HasDents,
                dentDescription: request.DentDescription,
                hasRust: request.HasRust,
                rustDescription: request.RustDescription,
                preConditionPdf: pdfBytes
            );
            finalEntity.CreatedAt = createdAt;

            // 9) Insert into MongoDB (stores the PDF binary in PreConditionPdf)
            await _vehiclePreConditionRepository.InsertVehiclePreCondition(finalEntity);

            // 10) Return an output DTO that includes the PDF bytes
            var resultDto = new VehiclePreConditionDto(finalEntity)
            {
                PreConditionPdf = pdfBytes
            };
            return resultDto;
        }
        public async Task<List<VehiclePreConditionDto>> GetAllVehiclePreConditions()
        {
            var preConditions = await _vehiclePreConditionRepository.GetAllVehiclePreConditions();
            return preConditions.Select(vp => new VehiclePreConditionDto(vp)).ToList();
        }

        public async Task<VehiclePreConditionDto> GetVehiclePreConditionById(Guid id)
        {
            var vp = await _vehiclePreConditionRepository.GetVehiclePreConditionById(id);
            return vp == null ? null : new VehiclePreConditionDto(vp);
        }

        public async Task<string> GetCustomerUsernameByPreConditionId(Guid preConditionId)
        {
            var preCondition = await _vehiclePreConditionRepository.GetVehiclePreConditionById(preConditionId);
            if (preCondition == null)
                throw new ArgumentException($"VehiclePreCondition with ID {preConditionId} not found.");

            int vehicleId = preCondition.VehicleId;

            var reservation = await _dbContext.Reservations
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.VehicleId == vehicleId);
            if (reservation == null)
                throw new ArgumentException($"No reservation found for VehicleId {vehicleId}.");

            int customerId = reservation.CustomerId;

            var customer = await _customerRepo.GetCustomerById(customerId);
            if (customer == null)
                throw new ArgumentException($"Customer with ID {customerId} not found.");
            return customer.Username;
        }

        public async Task<VehiclePreConditionDto> UpdateVehiclePreCondition(VehiclePreConditionDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle pre-condition data cannot be null.");
            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");

            // 1) Fetch existing record from Mongo
            var existing = await _vehiclePreConditionRepository.GetVehiclePreConditionById(dto.Id);
            if (existing == null)
                throw new ArgumentException("Vehicle pre-condition not found.");

            // 2) Verify vehicle still exists in SQL
            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            // 3) Prevent changing to a VehicleId that already has a different pre-condition
            var conflict = await _vehiclePreConditionRepository.GetVehiclePreConditionByVehicleId(dto.VehicleId);
            if (conflict != null && conflict.Id != dto.Id)
                throw new ArgumentException("Another VehiclePreCondition with this VehicleId already exists.");

            // 4) Validate/clear descriptions
            if (dto.HasScratches)
            {
                if (string.IsNullOrWhiteSpace(dto.ScratchDescription) ||
                    !dto.ScratchDescription.Any(char.IsLetter))
                {
                    throw new ArgumentException("Scratch description must contain letters when HasScratches is true.");
                }
            }
            else
            {
                dto.ScratchDescription = null;
            }

            if (dto.HasDents)
            {
                if (string.IsNullOrWhiteSpace(dto.DentDescription) ||
                    !dto.DentDescription.Any(char.IsLetter))
                {
                    throw new ArgumentException("Dent description must contain letters when HasDents is true.");
                }
            }
            else
            {
                dto.DentDescription = null;
            }

            if (dto.HasRust)
            {
                if (string.IsNullOrWhiteSpace(dto.RustDescription) ||
                    !dto.RustDescription.Any(char.IsLetter))
                {
                    throw new ArgumentException("Rust description must contain letters when HasRust is true.");
                }
            }
            else
            {
                dto.RustDescription = null;
            }

            // 5) Build a “temp” domain object (PDF placeholder uses existing.CreatedAt)
            var temp = new VehiclePreCondition(
                id: existing.Id,
                vehicleId: dto.VehicleId,
                hasScratches: dto.HasScratches,
                scratchDescription: dto.ScratchDescription,
                hasDents: dto.HasDents,
                dentDescription: dto.DentDescription,
                hasRust: dto.HasRust,
                rustDescription: dto.RustDescription,
                preConditionPdf: Array.Empty<byte>()  // placeholder for PDF generation
            );
            temp.CreatedAt = existing.CreatedAt; // preserve original timestamp

            // 6) Generate new PDF bytes from “temp”
            byte[] newPdfBytes = PreConditionPdfGenerator.Generate(temp);

            // 7) Build the “final” entity with updated fields and new PDF
            var updatedEntity = new VehiclePreCondition(
                id: existing.Id,
                vehicleId: dto.VehicleId,
                hasScratches: dto.HasScratches,
                scratchDescription: dto.ScratchDescription,
                hasDents: dto.HasDents,
                dentDescription: dto.DentDescription,
                hasRust: dto.HasRust,
                rustDescription: dto.RustDescription,
                preConditionPdf: newPdfBytes
            );
            updatedEntity.CreatedAt = existing.CreatedAt; // preserve original CreatedAt

            // 8) Replace the document in MongoDB (overwriting old PDF)
            await _vehiclePreConditionRepository.UpdateVehiclePreCondition(updatedEntity);

            // 9) Return a DTO containing the updated values + new PDF bytes
            var resultDto = new VehiclePreConditionDto(updatedEntity)
            {
                PreConditionPdf = newPdfBytes
            };
            return resultDto;
        }

        public async Task DeleteVehiclePreCondition(Guid id)
        {
            var existing = await _vehiclePreConditionRepository.GetVehiclePreConditionById(id);
            if (existing == null)
                throw new ArgumentException("Vehicle pre-condition not found.");

            await _vehiclePreConditionRepository.DeleteVehiclePreCondition(id);
        }

        public async Task<VehiclePreConditionDto> GetVehiclePreConditionByVehicleId(int vehicleId)
        {
            var preCondition = await _vehiclePreConditionRepository.GetVehiclePreConditionByVehicleId(vehicleId);
            return preCondition == null ? null : new VehiclePreConditionDto(preCondition);
        }

    }
}
