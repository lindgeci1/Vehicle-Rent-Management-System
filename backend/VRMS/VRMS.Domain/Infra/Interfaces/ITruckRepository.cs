using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface ITruckRepository
    {
        // Method to register or add a new truck
        Task AddTruck(Truck truck);

        // Method to get a truck by its ID
        Task<Truck> GetTruckById(int truckId);

        // Method to update an existing truck
        Task UpdateTruck(Truck truck);

        //// Method to delete a truck by its ID
        //Task DeleteTruck(int truckId);

        // Method to get all trucks
        Task<IEnumerable<Truck>> GetAllTrucks();

        // Filter by fuel type
        Task<IEnumerable<Truck>> GetTrucksByFuelType(string fuelType);

        // Filter by availability
        Task<IEnumerable<Truck>> GetAvailableTrucks();
    }
}
