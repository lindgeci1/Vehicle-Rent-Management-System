using VRMS.Application.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Application.Interface
{
    public interface IBusService
    {
        // Method to register or create a new bus
        Task<BusDto> CreateBus(BusDto busDto);

        // Method to get a bus by its ID
        Task<BusDto> GetBusById(int busId);

        // Method to update an existing bus
        Task<BusDto> UpdateBus(BusDto busDto);

        // Method to delete a bus by its ID
        Task DeleteBus(int busId);

        // Method to get all buses
        Task<IEnumerable<BusDto>> GetAllBuses();

        // Additional attribute filters
        Task<IEnumerable<BusDto>> GetBusesByFuelType(string fuelType);
        Task<IEnumerable<BusDto>> GetAvailableBuses();

        // Retrieve all models for a specific mark
        IEnumerable<string> GetModelsByMark(string mark);
    }
}
