using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class TripDetailsService : ITripDetailsService
    {
        private readonly ITripDetailsRepository _tripDetailsRepository;

        public TripDetailsService(ITripDetailsRepository tripDetailsRepository)
        {
            _tripDetailsRepository = tripDetailsRepository;
        }

        // Create a new trip detail record
        public async Task<TripDetailsDto> CreateTripDetails(TripDetailsDto tripDetailsDto)
        {
            if (tripDetailsDto == null)
            {
                throw new ArgumentException("Trip details cannot be null.");
            }

            if (tripDetailsDto.DaysTaken <= 0)
            {
                throw new ArgumentException("Days taken must be greater than zero.");
            }

            if (tripDetailsDto.DistanceTraveled <= 0)
            {
                throw new ArgumentException("Distance traveled must be greater than zero.");
            }

            if (tripDetailsDto.TotalCost <= 0)
            {
                throw new ArgumentException("Total cost must be greater than zero.");
            }


            var tripDetails = new TripDetails(
                tripDetailsDto.TripDetailsId,
                tripDetailsDto.VehicleId,
                tripDetailsDto.DaysTaken,
                tripDetailsDto.DistanceTraveled,
                tripDetailsDto.TotalCost
            );

            await _tripDetailsRepository.AddTripDetails(tripDetails);
            return new TripDetailsDto(tripDetails); // ✅ return DTO
        }

        // Get a trip detail by its ID
        public async Task<TripDetailsDto> GetTripDetailsById(int tripDetailsId)
        {
            var tripDetails = await _tripDetailsRepository.GetTripDetailsById(tripDetailsId);
            return tripDetails != null ? new TripDetailsDto(tripDetails) : null;
        }

        // Update trip details
        public async Task<TripDetailsDto> UpdateTripDetails(TripDetailsDto tripDetailsDto)
        {
         if (tripDetailsDto == null)
            {
                throw new ArgumentException("Trip details cannot be null.");
            }

            if (tripDetailsDto.DaysTaken <= 0)
            {
                throw new ArgumentException("Days taken must be greater than zero.");
            }

            if (tripDetailsDto.DistanceTraveled <= 0)
            {
                throw new ArgumentException("Distance traveled must be greater than zero.");
            }

            if (tripDetailsDto.TotalCost <= 0)
            {
                throw new ArgumentException("Total cost must be greater than zero.");
            }

            var existingTripDetails = await _tripDetailsRepository.GetTripDetailsById(tripDetailsDto.TripDetailsId);
            if (existingTripDetails == null)
            {
                throw new ArgumentException("Trip details not found.");
            }

            var tripDetails = new TripDetails(
                tripDetailsDto.TripDetailsId,
                tripDetailsDto.VehicleId,
                tripDetailsDto.DaysTaken,
                tripDetailsDto.DistanceTraveled,
                tripDetailsDto.TotalCost
            );

            await _tripDetailsRepository.UpdateTripDetails(tripDetails);
            return new TripDetailsDto(tripDetails); // ✅ return DTO
        }

        // Delete a trip detail by ID
        public async Task DeleteTripDetails(int tripDetailsId)
        {
            var existingTripDetails = await _tripDetailsRepository.GetTripDetailsById(tripDetailsId);
            if (existingTripDetails == null)
            {
                throw new ArgumentException("Trip details not found.");
            }

            await _tripDetailsRepository.DeleteTripDetails(tripDetailsId);
        }

        // Get all trip details
        public async Task<IEnumerable<TripDetailsDto>> GetAllTripDetails()
        {
            var tripDetailsList = await _tripDetailsRepository.GetAllTripDetails();
            return tripDetailsList.Select(td => new TripDetailsDto(td));
        }
    }
}
