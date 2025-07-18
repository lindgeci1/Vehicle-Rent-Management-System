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
    public class VehiclePostConditionService : IVehiclePostConditionService
    {
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository;
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly VRMSDbContext _dbContext;
        private readonly IReservationRepository _reservationRepository;
        private readonly IPaymentService _paymentService;
        ICustomerRepository _customerRepo;
        public VehiclePostConditionService(
            IVehiclePostConditionRepository postRepository,
            IVehiclePreConditionRepository preRepository,
            VRMSDbContext dbContext,
            IReservationRepository reservationRepository,
            IPaymentService paymentService,
            ICustomerRepository customerRepository)
        {
            _vehiclePostConditionRepository = postRepository;
            _vehiclePreConditionRepository = preRepository;
            _dbContext = dbContext;
            _reservationRepository = reservationRepository;
            _paymentService = paymentService;
            _customerRepo = customerRepository;
        }
        
        public async Task<VehiclePostConditionDto> CreateVehiclePostCondition(VehiclePostConditionDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle post-condition data cannot be null.");

            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");

            // 1) Verify the vehicle exists in SQL
            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            // 2) Prevent duplicate post-condition for the same vehicle
            var existing = await _vehiclePostConditionRepository
                .GetVehiclePostConditionByVehicleId(dto.VehicleId);
            if (existing != null)
                throw new ArgumentException("VehiclePostCondition for this vehicle already exists.");

            // 3) Ensure a pre-condition exists first
            var preCondition = await _vehiclePreConditionRepository
                .GetVehiclePreConditionByVehicleId(dto.VehicleId);
            if (preCondition == null)
                throw new ArgumentException("Cannot create a post-condition: the vehicle does not have a pre-condition.");

            // 4) Calculate totalCost based on differences from preCondition
            double totalCost = 0;

            // ❌ Invalid downgrades
            if (preCondition.HasScratches && !dto.HasScratches)
                throw new ArgumentException("Post-condition scratches cannot be false if pre-condition was true.");
            if (preCondition.HasDents && !dto.HasDents)
                throw new ArgumentException("Post-condition dents cannot be false if pre-condition was true.");
            if (preCondition.HasRust && !dto.HasRust)
                throw new ArgumentException("Post-condition rust cannot be false if pre-condition was true.");

            // New or worsened damage
            if (!preCondition.HasScratches && dto.HasScratches)
                totalCost += 100;
            else if (preCondition.HasScratches && dto.HasScratches &&
                     !string.Equals(dto.ScratchDescription?.Trim(), preCondition.ScratchDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
                totalCost += 50;

            if (!preCondition.HasDents && dto.HasDents)
                totalCost += 150;
            else if (preCondition.HasDents && dto.HasDents &&
                     !string.Equals(dto.DentDescription?.Trim(), preCondition.DentDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
                totalCost += 75;

            if (!preCondition.HasRust && dto.HasRust)
                totalCost += 200;
            else if (preCondition.HasRust && dto.HasRust &&
                     !string.Equals(dto.RustDescription?.Trim(), preCondition.RustDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
                totalCost += 100;

            // 5) Validate/clear descriptions exactly as you did before
            dto.ScratchDescription = dto.HasScratches
                ? (!string.IsNullOrWhiteSpace(dto.ScratchDescription) && dto.ScratchDescription.Any(char.IsLetter)
                    ? dto.ScratchDescription
                    : throw new ArgumentException("Scratch description must contain letters when HasScratches is true."))
                : null;

            dto.DentDescription = dto.HasDents
                ? (!string.IsNullOrWhiteSpace(dto.DentDescription) && dto.DentDescription.Any(char.IsLetter)
                    ? dto.DentDescription
                    : throw new ArgumentException("Dent description must contain letters when HasDents is true."))
                : null;

            dto.RustDescription = dto.HasRust
                ? (!string.IsNullOrWhiteSpace(dto.RustDescription) && dto.RustDescription.Any(char.IsLetter)
                    ? dto.RustDescription
                    : throw new ArgumentException("Rust description must contain letters when HasRust is true."))
                : null;

            // 6) Generate a new Guid (ID) for this post-condition:
            var newId = Guid.NewGuid();

            // 7) Build a “temporary” VehiclePostCondition with an empty PDF placeholder.
            //    Your constructor will set CreatedAt = DateTime.UtcNow internally.
            var tempPost = new VehiclePostCondition(
                id: newId,
                vehicleId: dto.VehicleId,
                hasScratches: dto.HasScratches,
                scratchDescription: dto.ScratchDescription,
                hasDents: dto.HasDents,
                dentDescription: dto.DentDescription,
                hasRust: dto.HasRust,
                rustDescription: dto.RustDescription,
                totalCost: totalCost,
                postConditionPdf: Array.Empty<byte>() // placeholder—PDF will be overwritten
            );
            var existingPre = await _vehiclePreConditionRepository
    .GetVehiclePreConditionByVehicleId(dto.VehicleId);
            if (existingPre == null)
                throw new ArgumentException("Cannot generate PDF: no pre‐condition found.");
            // 8) Generate the actual PDF bytes from “tempPost”
            byte[] pdfBytes = PostConditionPdfGenerator.Generate(existingPre, tempPost);

            // 9) Build the final entity—this constructor call sets CreatedAt = now again,
            //    but that’s fine (both the temp and final CreatedAt will be nearly identical).
            var finalEntity = new VehiclePostCondition(
                id: newId,
                vehicleId: dto.VehicleId,
                hasScratches: dto.HasScratches,
                scratchDescription: dto.ScratchDescription,
                hasDents: dto.HasDents,
                dentDescription: dto.DentDescription,
                hasRust: dto.HasRust,
                rustDescription: dto.RustDescription,
                totalCost: totalCost,
                postConditionPdf: pdfBytes        // <-- now embed the real PDF
            );

            // 10) Insert into MongoDB (storing the PDF in PostConditionPdf field)
            await _vehiclePostConditionRepository.InsertVehiclePostCondition(finalEntity);

            // 11) If the reservation is already “brought back,” trigger final payment
            var reservation = await _reservationRepository.GetReservationByVehicleId(dto.VehicleId);
            if (reservation != null && reservation.BroughtBack)
            {
                await _paymentService.CreateFinalPaymentForReservationAsync(reservation.ReservationId);
            }

            // 12) Return a DTO containing all fields + the PDF bytes
            var resultDto = new VehiclePostConditionDto(finalEntity)
            {
                PostConditionPdf = pdfBytes
            };
            return resultDto;
        }

        public async Task<List<VehiclePostConditionDto>> GetAllVehiclePostConditions()
        {
            var postConditions = await _vehiclePostConditionRepository.GetAllVehiclePostConditions();
            return postConditions.Select(vp => new VehiclePostConditionDto(vp)).ToList();
        }

        public async Task<VehiclePostConditionDto> GetVehiclePostConditionById(Guid id)
        {
            var vp = await _vehiclePostConditionRepository.GetVehiclePostConditionById(id);
            return vp == null ? null : new VehiclePostConditionDto(vp);
        }

        //public async Task<VehiclePostConditionDto> UpdateVehiclePostCondition(VehiclePostConditionDto dto)
        //{
        //    if (dto == null)
        //        throw new ArgumentException("Vehicle post-condition data cannot be null.");
        //    if (dto.VehicleId == 0)
        //        throw new ArgumentException("VehicleId cannot be 0.");

        //    var existing = await _vehiclePostConditionRepository.GetVehiclePostConditionById(dto.Id);
        //    if (existing == null)
        //        throw new ArgumentException("Vehicle post-condition not found.");

        //    var vehicleExists = await _dbContext.Vehicles
        //        .AnyAsync(v => v.VehicleId == dto.VehicleId);

        //    if (!vehicleExists)
        //        throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

        //    var conflict = await _vehiclePostConditionRepository.GetVehiclePostConditionByVehicleId(dto.VehicleId);
        //    if (conflict != null && conflict.Id != dto.Id)
        //        throw new ArgumentException("Another VehiclePostCondition with this VehicleId already exists.");

        //    var preCondition = await _vehiclePreConditionRepository
        //        .GetVehiclePreConditionByVehicleId(dto.VehicleId);

        //    if (preCondition == null)
        //        throw new ArgumentException("Cannot update post-condition: the vehicle does not have a pre-condition.");

        //    double totalCost = 0;

        //    // ❌ Invalid downgrades
        //    if (preCondition.HasScratches && !dto.HasScratches)
        //        throw new ArgumentException("Post-condition scratches cannot be false if pre-condition was true.");
        //    if (preCondition.HasDents && !dto.HasDents)
        //        throw new ArgumentException("Post-condition dents cannot be false if pre-condition was true.");
        //    if (preCondition.HasRust && !dto.HasRust)
        //        throw new ArgumentException("Post-condition rust cannot be false if pre-condition was true.");

        //    // New or worsened damage
        //    if (!preCondition.HasScratches && dto.HasScratches)
        //        totalCost += 100;
        //    else if (preCondition.HasScratches && dto.HasScratches &&
        //             !string.Equals(dto.ScratchDescription?.Trim(), preCondition.ScratchDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
        //        totalCost += 50;

        //    if (!preCondition.HasDents && dto.HasDents)
        //        totalCost += 150;
        //    else if (preCondition.HasDents && dto.HasDents &&
        //             !string.Equals(dto.DentDescription?.Trim(), preCondition.DentDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
        //        totalCost += 75;

        //    if (!preCondition.HasRust && dto.HasRust)
        //        totalCost += 200;
        //    else if (preCondition.HasRust && dto.HasRust &&
        //             !string.Equals(dto.RustDescription?.Trim(), preCondition.RustDescription?.Trim(), StringComparison.OrdinalIgnoreCase))
        //        totalCost += 100;

        //    // ✅ Validate descriptions
        //    dto.ScratchDescription = dto.HasScratches ?
        //        (!string.IsNullOrWhiteSpace(dto.ScratchDescription) && dto.ScratchDescription.Any(char.IsLetter)
        //            ? dto.ScratchDescription
        //            : throw new ArgumentException("Scratch description must contain letters when HasScratches is true."))
        //        : null;

        //    dto.DentDescription = dto.HasDents ?
        //        (!string.IsNullOrWhiteSpace(dto.DentDescription) && dto.DentDescription.Any(char.IsLetter)
        //            ? dto.DentDescription
        //            : throw new ArgumentException("Dent description must contain letters when HasDents is true."))
        //        : null;

        //    dto.RustDescription = dto.HasRust ?
        //        (!string.IsNullOrWhiteSpace(dto.RustDescription) && dto.RustDescription.Any(char.IsLetter)
        //            ? dto.RustDescription
        //            : throw new ArgumentException("Rust description must contain letters when HasRust is true."))
        //        : null;

        //    var updated = new VehiclePostCondition(
        //        dto.Id,
        //        dto.VehicleId,
        //        dto.HasScratches,
        //        dto.ScratchDescription,
        //        dto.HasDents,
        //        dto.DentDescription,
        //        dto.HasRust,
        //        dto.RustDescription,
        //        totalCost
        //    );

        //    await _vehiclePostConditionRepository.UpdateVehiclePostCondition(updated);
        //    return new VehiclePostConditionDto(updated);
        //}

        public async Task DeleteVehiclePostCondition(Guid id)
        {
            var existing = await _vehiclePostConditionRepository.GetVehiclePostConditionById(id);
            if (existing == null)
                throw new ArgumentException("Vehicle post-condition not found.");

            await _vehiclePostConditionRepository.DeleteVehiclePostCondition(id);
        }

        public async Task<VehiclePostConditionDto> GetVehiclePostConditionByVehicleId(int vehicleId)
        {
            var preCondition = await _vehiclePostConditionRepository.GetVehiclePostConditionByVehicleId(vehicleId);
            return preCondition == null ? null : new VehiclePostConditionDto(preCondition);
        }

        public async Task<string> GetCustomerUsernameByPreConditionId(Guid preConditionId)
        {
            var postCondition = await _vehiclePostConditionRepository.GetVehiclePostConditionById(preConditionId);
            if (postCondition == null)
                throw new ArgumentException($"VehiclePostCondition with ID {preConditionId} not found.");

            int vehicleId = postCondition.VehicleId;

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
    }
}