using VRMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IVehicleRatingRepository
    {
        Task InsertVehicleRating(VehicleRating vehicleRating);
        Task<VehicleRating> GetVehicleRatingById(Guid id);
        Task<List<VehicleRating>> GetVehicleRatingsByVehicleId(int vehicleId);
        Task<List<VehicleRating>> GetVehicleRatingsByCustomerId(int customerId);
        Task<List<VehicleRating>> GetAllVehicleRatings();
        Task UpdateVehicleRating(VehicleRating updatedRating);
        Task DeleteVehicleRating(Guid id);
    }
}
