// VehicleRatingService.cs
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VRMS.Infrastructure.Repositories;

namespace VRMS.Application.Services
{
    public class VehicleRatingService : IVehicleRatingService
    {
        private readonly IVehicleRatingRepository _vehicleRatingRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly VRMSDbContext _dbContext;

        public VehicleRatingService(
            IVehicleRatingRepository vehicleRatingRepository,
            ICustomerRepository customerRepository,
            VRMSDbContext dbContext)
        {
            _vehicleRatingRepository = vehicleRatingRepository;
            _customerRepository = customerRepository;
            _dbContext = dbContext;
        }

        public async Task<VehicleRatingDto> CreateVehicleRating(VehicleRatingDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle rating data cannot be null.");
            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");
            if (dto.CustomerId == 0)
                throw new ArgumentException("CustomerId cannot be 0.");
            if (dto.RatingValue < 1 || dto.RatingValue > 5)
                throw new ArgumentException("RatingValue must be between 1 and 5.");

            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            var isCustomer = await _customerRepository.CustomerExistsByUserId(dto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Rating can only be assigned to customers.");

            var rating = new VehicleRating(
                Guid.NewGuid(),
                dto.CustomerId,
                dto.VehicleId,
                dto.RatingValue,
                dto.ReviewComment
            );

            await _vehicleRatingRepository.InsertVehicleRating(rating);
            return new VehicleRatingDto(rating);
        }

        public async Task<List<VehicleRatingDto>> GetAllVehicleRatings()
        {
            var ratings = await _vehicleRatingRepository.GetAllVehicleRatings();
            return ratings
                .Select(r => new VehicleRatingDto(r))
                .ToList();
        }

        public async Task<VehicleRatingDto> GetVehicleRatingById(Guid id)
        {
            var rating = await _vehicleRatingRepository.GetVehicleRatingById(id);
            return rating == null ? null : new VehicleRatingDto(rating);
        }

        public async Task<List<VehicleRatingDto>> GetVehicleRatingsByVehicleId(int vehicleId)
        {
            var ratings = await _vehicleRatingRepository.GetVehicleRatingsByVehicleId(vehicleId);
            return ratings
                .Select(r => new VehicleRatingDto(r))
                .ToList();
        }

        public async Task<List<VehicleRatingDto>> GetVehicleRatingsByCustomerId(int vehicleId)
        {
            var ratings = await _vehicleRatingRepository.GetVehicleRatingsByCustomerId(vehicleId);
            return ratings
                .Select(r => new VehicleRatingDto(r))
                .ToList();
        }

        public async Task<VehicleRatingDto> UpdateVehicleRating(VehicleRatingDto dto)
        {
            if (dto == null)
                throw new ArgumentException("Vehicle rating data cannot be null.");
            if (dto.VehicleId == 0)
                throw new ArgumentException("VehicleId cannot be 0.");
            if (dto.CustomerId == 0)
                throw new ArgumentException("CustomerId cannot be 0.");
            if (dto.RatingValue < 1 || dto.RatingValue > 5)
                throw new ArgumentException("RatingValue must be between 1 and 5.");

            var existing = await _vehicleRatingRepository.GetVehicleRatingById(dto.Id);
            if (existing == null)
                throw new ArgumentException("Vehicle rating not found.");

            var vehicleExists = await _dbContext.Vehicles
                .AnyAsync(v => v.VehicleId == dto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the provided VehicleId does not exist.");

            var isCustomer = await _customerRepository.CustomerExistsByUserId(dto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Rating can only be assigned to customers.");

            var updated = new VehicleRating(
                dto.Id,
                dto.CustomerId,
                dto.VehicleId,
                dto.RatingValue,
                dto.ReviewComment
            );

            await _vehicleRatingRepository.UpdateVehicleRating(updated);
            return new VehicleRatingDto(updated);
        }

        public async Task DeleteVehicleRating(Guid id)
        {
            var existing = await _vehicleRatingRepository.GetVehicleRatingById(id);
            if (existing == null)
                throw new ArgumentException("Vehicle rating not found.");

            await _vehicleRatingRepository.DeleteVehicleRating(id);
        }
    }
}
