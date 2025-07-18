using VRMS.Application.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Application.Interface
{
    public interface ITruckService
    {
        // Method to register or create a new truck
        Task<TruckDto> CreateTruck(TruckDto truckDto);

        // Method to get a truck by its ID
        Task<TruckDto> GetTruckById(int truckId);

        // Method to update an existing truck
        Task<TruckDto> UpdateTruck(TruckDto truckDto);

        // Method to delete a truck by its ID
        Task DeleteTruck(int truckId);

        // Method to get all trucks
        Task<IEnumerable<TruckDto>> GetAllTrucks();

        // Additional attribute filters
        Task<IEnumerable<TruckDto>> GetTrucksByFuelType(string fuelType);
        Task<IEnumerable<TruckDto>> GetAvailableTrucks();

        // Retrieve all models for a specific mark
        IEnumerable<string> GetModelsByMark(string mark);
    }
}
