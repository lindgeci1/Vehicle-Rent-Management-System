using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Application.Interface;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.EntityFrameworkCore;
using VRMS.Api.Services;

namespace VRMS.Application.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        private readonly IVehiclePreConditionRepository _vehiclePreConditionRepository;
        private readonly IVehiclePostConditionRepository _vehiclePostConditionRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly IPhotoService _photoService;
        private readonly IVehicleRatingRepository _vehicleRatingRepository;
        public VehicleService(
            IVehicleRepository vehicleRepository,
            IVehicleHistoryRepository vehicleHistoryRepository,
            IVehiclePreConditionRepository vehiclePreConditionRepository,
            IVehiclePostConditionRepository vehiclePostConditionRepository,
            IReservationRepository reservationRepository,
            IPhotoService photoService,
            IVehicleRatingRepository vehicleRatingRepository)
        {
            _vehicleRepository = vehicleRepository;
            _vehicleHistoryRepository = vehicleHistoryRepository;
            _vehiclePreConditionRepository = vehiclePreConditionRepository;
            _vehiclePostConditionRepository = vehiclePostConditionRepository;
            _reservationRepository = reservationRepository;
            _photoService = photoService;
            _vehicleRatingRepository = vehicleRatingRepository;
        }

        // Get all vehicles
        public async Task<IEnumerable<VehicleDto>> GetAllVehicles()
        {
            var vehicleList = await _vehicleRepository.GetAllVehicles();
            return vehicleList.Select(v => new VehicleDto(v));
        }

        public async Task<VehicleDto> GetVehicleById(int vehicleId)
        {
            var vehicle = await _vehicleRepository.GetVehicleById(vehicleId);
            return vehicle != null ? new VehicleDto(vehicle) : null;
        }

        public async Task DeleteVehicle(int vehicleId)
        {
            var existingVehicle = await _vehicleRepository.GetVehicleById(vehicleId);
            if (existingVehicle == null)
            {
                throw new ArgumentException("Vehicle not found.");
            }

            // Delete related VehicleHistory from MongoDB
            var existingHistory = await _vehicleHistoryRepository.GetVehicleHistoryByVehicleId(vehicleId);
            if (existingHistory != null)
            {
                await _vehicleHistoryRepository.DeleteVehicleHistory(existingHistory.Id);
            }

            // ✅ Delete related VehiclePreCondition from MongoDB
            var existingPreCondition = await _vehiclePreConditionRepository.GetVehiclePreConditionByVehicleId(vehicleId);
            if (existingPreCondition != null)
            {
                await _vehiclePreConditionRepository.DeleteVehiclePreCondition(existingPreCondition.Id);
            }
            var existingPostCondition = await _vehiclePostConditionRepository.GetVehiclePostConditionByVehicleId(vehicleId);
            if (existingPostCondition != null)
            {
                await _vehiclePostConditionRepository.DeleteVehiclePostCondition(existingPostCondition.Id);
            }

            var ratings = await _vehicleRatingRepository.GetVehicleRatingsByVehicleId(vehicleId);
            if (ratings != null && ratings.Any())
            {
                foreach (var rating in ratings)
                {
                    await _vehicleRatingRepository.DeleteVehicleRating(rating.Id);
                }
            }
            foreach (var photo in existingVehicle.Photos)
            {
                if (!string.IsNullOrWhiteSpace(photo.PublicId))
                {
                    var deleted = await _photoService.DeleteAsync(photo.PublicId);
                    Console.WriteLine($"Cloudinary photo deleted: {deleted} | PublicId: {photo.PublicId}");
                }
            }

            // Delete the vehicle from SQL
            await _vehicleRepository.DeleteVehicle(vehicleId);
        }

        //public async Task<IEnumerable<VehicleDto>> GetAvailableVehiclesByDateAndCategory(DateTime startDate, DateTime endDate, string category)
        //{
        //    var logs = await UpdateVehicleAvailabilityForToday();
        //    Console.WriteLine("[VehicleAvailability] Search Method");
        //    foreach (var log in logs)
        //    {
        //        Console.WriteLine(log);
        //    }

        //    var allVehicles = await _vehicleRepository.GetAllVehicles();
        //    var allReservations = await _reservationRepository.GetAllReservations();

        //    var unavailableVehicleIds = allReservations
        //        .Where(r =>
        //            (startDate <= r.EndDate && endDate >= r.StartDate)
        //        )
        //        .Select(r => r.VehicleId)
        //        .ToHashSet();

        //    var filteredVehicles = allVehicles
        //        .Where(v =>
        //            v.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
        //            !unavailableVehicleIds.Contains(v.VehicleId)
        //        );

        //    // ✅ Fix local IsAvailable for these vehicles only in the response
        //    var vehicleDtos = filteredVehicles.Select(v =>
        //    {
        //        if (!v.IsAvailable)
        //        {
        //            Console.WriteLine($"[VehicleAvailability] Overriding IsAvailable for Vehicle ID {v.VehicleId} to true (based on filter range).");
        //            v.IsAvailable = true; // only in-memory, not saved to DB
        //        }
        //        return new VehicleDto(v);
        //    });

        //    return vehicleDtos;
        //}
        public async Task<IEnumerable<VehicleDto>> GetAvailableVehiclesByDateAndCategory(
            DateTime startDate,
            DateTime endDate,
            string category,
            int? seats = null,
            string? fuelType = null,
            int? year = null,
            string? transmission = null)
        {
            var logs = await UpdateVehicleAvailabilityForToday();
            var allVehicles = await _vehicleRepository.GetAllVehicles();
            var allReservations = await _reservationRepository.GetAllReservations();

            var unavailableVehicleIds = allReservations
                .Where(r => startDate <= r.EndDate && endDate >= r.StartDate)
                .Select(r => r.VehicleId)
                .ToHashSet();

            var allowedFuelTypes = new[] { "Petrol", "Diesel", "Electric", "Hybrid" };

            var filteredVehicles = allVehicles
                .Where(v =>
                    v.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                    !unavailableVehicleIds.Contains(v.VehicleId) &&
                    (!seats.HasValue || v.SeatingCapacity == seats.Value) &&
                    (string.IsNullOrWhiteSpace(fuelType) ||
                        (allowedFuelTypes.Contains(v.FuelType, StringComparer.OrdinalIgnoreCase) &&
                         v.FuelType.Equals(fuelType, StringComparison.OrdinalIgnoreCase))) &&
                    (!year.HasValue || v.Year == year.Value) &&
                    (string.IsNullOrWhiteSpace(transmission) ||
                        v.Transmission.Equals(transmission, StringComparison.OrdinalIgnoreCase))
                ).ToList();

            Console.WriteLine("🔎 Filtered Vehicles:");
            foreach (var v in filteredVehicles)
                Console.WriteLine($"➡️ {v.Mark} {v.Model} - Seats: {v.SeatingCapacity}, Fuel: {v.FuelType}, Year: {v.Year}");

            return filteredVehicles.Select(v =>
            {
                if (!v.IsAvailable) v.IsAvailable = true;
                return new VehicleDto(v);
            });
        }





        public async Task<List<string>> UpdateVehicleAvailabilityForToday()
        {
            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time"));
            var today = localNow.Date;
            var allVehicles = await _vehicleRepository.GetAllVehicles();
            var allReservations = await _reservationRepository.GetAllReservations();

            //var reservedVehicleIds = allReservations
            //    .Where(r => r.StartDate <= today && r.EndDate >= today)
            //    .Select(r => r.VehicleId)
            //    .ToHashSet();
            var reservedVehicleIds = allReservations
            .Where(r => r.PickedUp && !r.BroughtBack)
            .Select(r => r.VehicleId)
            .ToHashSet();

            var updateLogs = new List<string>();

            foreach (var vehicle in allVehicles)
            {
                bool isReservedToday = reservedVehicleIds.Contains(vehicle.VehicleId);
                bool newAvailability = !isReservedToday;

                if (vehicle.IsAvailable != newAvailability)
                {
                    vehicle.IsAvailable = newAvailability;
                    await _vehicleRepository.UpdateVehicle(vehicle);

                    string logEntry = $"[{localNow:yyyy-MM-dd HH:mm:ss}] Vehicle {vehicle.VehicleId} availability updated.";
                    updateLogs.Add(logEntry);
                    Console.WriteLine(logEntry);
                }
            }

            return updateLogs;
        }
        //public async Task<List<string>> UpdateVehicleAvailabilityForToday()
        //{
        //    var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time"));
        //    var today = localNow.Date;
        //    var allVehicles = await _vehicleRepository.GetAllVehicles();
        //    var allReservations = await _reservationRepository.GetAllReservations();

        //    var updateLogs = new List<string>();

        //    foreach (var vehicle in allVehicles)
        //    {
        //        bool isReservedToday = allReservations.Any(r =>
        //            r.VehicleId == vehicle.VehicleId &&
        //            r.StartDate <= today &&
        //            r.EndDate >= today
        //        );

        //        bool newAvailability = !isReservedToday;

        //        if (vehicle.IsAvailable != newAvailability)
        //        {
        //            vehicle.IsAvailable = newAvailability;
        //            await _vehicleRepository.UpdateVehicle(vehicle);

        //            string logEntry = $"[{localNow:yyyy-MM-dd HH:mm:ss}] Vehicle {vehicle.VehicleId} availability updated.";
        //            updateLogs.Add(logEntry);
        //            Console.WriteLine(logEntry);
        //        }
        //    }

        //    return updateLogs;
        //}

        public async Task<PhotoDto> AddPhotoToVehicle(int vehicleId, PhotoDto photoDto)
        {
            // Ensure the vehicle exists
            var exists = await _vehicleRepository.GetVehicleById(vehicleId)
                         ?? throw new ArgumentException("Vehicle not found.");

            // Create the Photo entity
            var photo = new Photo(
                photoId: 0,
                url: photoDto.Url,
                publicId: photoDto.PublicId,
                vehicleId: vehicleId
            );

            // Persist just the photo row
            await _vehicleRepository.AddPhoto(photo);

            return photoDto;
        }
        public async Task<decimal> GetDailyRentalCost(int vehicleId)
        {
            var vehicle = await _vehicleRepository.GetVehicleById(vehicleId)
                ?? throw new ArgumentException("Vehicle not found.");

            var priceService = new PriceService();

            return priceService.CalculateDailyPayment(vehicle.Category, vehicle.Mark, vehicle.Year);
        }

        public async Task ClearVehiclePhotos(int vehicleId)
        {
            var vehicle = await _vehicleRepository.GetVehicleById(vehicleId)
                          ?? throw new ArgumentException("Vehicle not found.");

            if (vehicle.Photos == null || !vehicle.Photos.Any())
                return;

            foreach (var photo in vehicle.Photos)
            {
                if (!string.IsNullOrWhiteSpace(photo.PublicId))
                {
                    await _photoService.DeleteAsync(photo.PublicId); // Deletes from Cloudinary
                }
            }

            // Remove from database (EF handles via navigation property if tracked)
            await _vehicleRepository.DeletePhotosByVehicleId(vehicleId);
        }

        public async Task<Vehicle?> FindSimilarAvailableVehicle(string category, string mark, int year, DateTime startDate, DateTime endDate)
        {
            var allVehicles = await _vehicleRepository.GetAllVehicles();
            var allReservations = await _reservationRepository.GetAllReservations();

            var unavailableVehicleIds = allReservations
                .Where(r => r.PickedUp && !r.BroughtBack)
                .Select(r => r.VehicleId)
                .ToHashSet();

            var priceService = new PriceService();
            var targetFee = priceService.CalculatePrepayFee(category, mark, year);

            var candidates = allVehicles
                .Where(v =>
                    v.Category.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                    !unavailableVehicleIds.Contains(v.VehicleId) &&
                    priceService.CalculatePrepayFee(v.Category, v.Mark, v.Year) == targetFee
                )
                .ToList();

            Console.WriteLine($"🔍 Found {candidates.Count} candidate vehicles for reassignment:");
            foreach (var c in candidates)
            {
                var calculatedFee = priceService.CalculatePrepayFee(c.Category, c.Mark, c.Year);
                Console.WriteLine($" → VehicleId={c.VehicleId}, Mark={c.Mark}, Year={c.Year}, Fee={calculatedFee}");
            }

            return candidates.FirstOrDefault();
        }
        public async Task<List<VehicleRatingDto>> GetRatingsForVehicle(int vehicleId)
        {
            var ratings = await _vehicleRatingRepository.GetVehicleRatingsByVehicleId(vehicleId);

            return ratings
                .Select(r => new VehicleRatingDto
                {
                    Id = r.Id,
                    VehicleId = r.VehicleId,
                    CustomerId = r.CustomerId,
                    RatingValue = r.RatingValue,
                    ReviewComment = string.IsNullOrWhiteSpace(r.ReviewComment) ? null : r.ReviewComment
                })
                .ToList();
        }


    }
}
