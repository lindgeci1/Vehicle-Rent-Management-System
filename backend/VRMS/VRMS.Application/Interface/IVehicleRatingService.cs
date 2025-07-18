// IVehicleRatingService.cs
using VRMS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface IVehicleRatingService
    {
        Task<VehicleRatingDto> CreateVehicleRating(VehicleRatingDto dto);
        Task<List<VehicleRatingDto>> GetAllVehicleRatings();
        Task<VehicleRatingDto> GetVehicleRatingById(Guid id);
        Task<List<VehicleRatingDto>> GetVehicleRatingsByVehicleId(int vehicleId);
        Task<List<VehicleRatingDto>> GetVehicleRatingsByCustomerId(int vehicleId);
        Task<VehicleRatingDto> UpdateVehicleRating(VehicleRatingDto dto);
        Task DeleteVehicleRating(Guid id);
    }
}
