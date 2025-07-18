using VRMS.Application.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Application.Interface
{
    public interface ICarService
    {
        // Method to register or create a new car
        Task<CarDto> CreateCar(CarDto carDto);


        // Method to get a car by its ID
        Task<CarDto> GetCarById(int carId);

        // Method to update an existing car
        Task<CarDto> UpdateCar(CarDto carDto);

        // Method to delete a car by its ID
        Task DeleteCar(int carId);

        // Method to get all cars
        Task<IEnumerable<CarDto>> GetAllCars();

        // Additional attributes of Car
        Task<IEnumerable<CarDto>> GetCarsByFuelType(string fuelType);
        Task<IEnumerable<CarDto>> GetAvailableCars();

        IEnumerable<string> GetModelsByMark(string mark);
    }
}
