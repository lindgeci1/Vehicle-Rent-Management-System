using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class CarRepository : ICarRepository
    {
        private readonly VRMSDbContext _context;

        public CarRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Method to add a new car
        public async Task AddCar(Car car)
        {
            await _context.Cars.AddAsync(car);
            await _context.SaveChangesAsync();
        }

        // Method to get a car by its ID
        public async Task<Car> GetCarById(int carId)
        {
            return await _context.Cars
                .Include(c => c.Photos)       // ← include the photos
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.VehicleId == carId);
        }


        // Method to update an existing car
        public async Task UpdateCar(Car car)
        {
            var existingCar = await _context.Cars.AsNoTracking()
                .FirstOrDefaultAsync(c => c.VehicleId == car.VehicleId);

            if (existingCar != null)
            {
                _context.Entry(existingCar).State = EntityState.Detached;
            }

            _context.Cars.Update(car);
            await _context.SaveChangesAsync();
        }

        // Method to delete a car by its ID
        //public async Task DeleteCar(int carId)
        //{
        //    var car = await GetCarById(carId);
        //    if (car != null)
        //    {
        //        _context.Cars.Remove(car);
        //        await _context.SaveChangesAsync();
        //    }
        //}

        // Method to get all cars
        public async Task<IEnumerable<Car>> GetAllCars()
        {
            return await _context.Cars
                .Include(c => c.Photos)               // ← include here too
                .AsNoTracking()
                .ToListAsync();
        }

        // Method to get cars by fuel type
        public async Task<IEnumerable<Car>> GetCarsByFuelType(string fuelType)
        {
            return await _context.Cars.AsNoTracking()
                .Where(c => c.FuelType == fuelType)
                .ToListAsync();
        }

        // Method to get available cars
        public async Task<IEnumerable<Car>> GetAvailableCars()
        {
            return await _context.Cars.AsNoTracking()
                .Where(c => c.IsAvailable)
                .ToListAsync();
        }

    }
}
