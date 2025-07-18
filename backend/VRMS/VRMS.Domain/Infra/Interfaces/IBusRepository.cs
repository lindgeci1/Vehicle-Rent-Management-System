using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IBusRepository
    {
        // Method to register or add a new bus
        Task AddBus(Bus bus);

        // Method to get a bus by its ID
        Task<Bus> GetBusById(int busId);

        // Method to update an existing bus
        Task UpdateBus(Bus bus);

        //// Method to delete a bus by its ID
        //Task DeleteBus(int busId);

        // Method to get all buses
        Task<IEnumerable<Bus>> GetAllBuses();

        // Additional attribute methods
        Task<IEnumerable<Bus>> GetBusesByFuelType(string fuelType);
        Task<IEnumerable<Bus>> GetAvailableBuses();
    }
}