using VRMS.Application.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Application.Interface
{
    public interface IMotorcycleService
    {
        // Method to register or create a new motorcycle
        Task<MotorcycleDto> CreateMotorcycle(MotorcycleDto motorcycleDto);

        // Method to get a motorcycle by its ID
        Task<MotorcycleDto> GetMotorcycleById(int motorcycleId);

        // Method to update an existing motorcycle
        Task<MotorcycleDto> UpdateMotorcycle(MotorcycleDto motorcycleDto);

        // Method to delete a motorcycle by its ID
        Task DeleteMotorcycle(int motorcycleId);

        // Method to get all motorcycles
        Task<IEnumerable<MotorcycleDto>> GetAllMotorcycles();

        // Additional attributes of Motorcycle (same as Car)
        Task<IEnumerable<MotorcycleDto>> GetMotorcyclesByFuelType(string fuelType);
        Task<IEnumerable<MotorcycleDto>> GetAvailableMotorcycles();

        IEnumerable<string> GetModelsByMark(string mark);
    }
}
