using VRMS.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Application.Interface
{
    public interface IVehicleService
    {
        // Get all vehicles
        Task<IEnumerable<VehicleDto>> GetAllVehicles();

        // Get a specific vehicle by its ID
        Task<VehicleDto> GetVehicleById(int vehicleId);

        // Delete a vehicle by ID
        Task DeleteVehicle(int vehicleId);

        Task<IEnumerable<VehicleDto>> GetAvailableVehiclesByDateAndCategory(DateTime startDate, DateTime endDate, string category, int? seats = null, string? fuelType = null, int? year = null, string? transmission = null);
        Task<List<string>> UpdateVehicleAvailabilityForToday();

        Task<PhotoDto> AddPhotoToVehicle(int vehicleId, PhotoDto photo);

        Task ClearVehiclePhotos(int vehicleId);

        Task<Vehicle?> FindSimilarAvailableVehicle(string category, string mark, int year, DateTime startDate, DateTime endDate);

        Task<List<VehicleRatingDto>> GetRatingsForVehicle(int vehicleId);

        Task<decimal> GetDailyRentalCost(int vehicleId);
    }
}
