using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface ICarRepository
    {
        // Method to register or add a new car
        Task AddCar(Car car);

        // Method to get a car by its ID
        Task<Car> GetCarById(int carId);

        // Method to update an existing car
        Task UpdateCar(Car car);

        //// Method to delete a car by its ID
        //Task DeleteCar(int carId);

        // Method to get all cars
        Task<IEnumerable<Car>> GetAllCars();

        // Additional attributes methods
        Task<IEnumerable<Car>> GetCarsByFuelType(string fuelType);
        Task<IEnumerable<Car>> GetAvailableCars();

    }
}
