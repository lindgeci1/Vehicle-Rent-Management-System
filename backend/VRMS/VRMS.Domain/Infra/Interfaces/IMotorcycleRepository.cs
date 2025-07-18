using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IMotorcycleRepository
    {
        // Method to register or add a new motorcycle
        Task AddMotorcycle(Motorcycle motorcycle);

        // Method to get a motorcycle by its ID
        Task<Motorcycle> GetMotorcycleById(int motorcycleId);

        // Method to update an existing motorcycle
        Task UpdateMotorcycle(Motorcycle motorcycle);

        //// Method to delete a motorcycle by its ID
        //Task DeleteMotorcycle(int motorcycleId);

        // Method to get all motorcycles
        Task<IEnumerable<Motorcycle>> GetAllMotorcycles();

        // Additional attribute methods
        Task<IEnumerable<Motorcycle>> GetMotorcyclesByFuelType(string fuelType);
        Task<IEnumerable<Motorcycle>> GetAvailableMotorcycles();
    }
}
