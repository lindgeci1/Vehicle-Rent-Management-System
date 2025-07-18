using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class MotorcycleRepository : IMotorcycleRepository
    {
        private readonly VRMSDbContext _context;

        public MotorcycleRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Method to add a new motorcycle
        public async Task AddMotorcycle(Motorcycle motorcycle)
        {
            await _context.Motorcycles.AddAsync(motorcycle);
            await _context.SaveChangesAsync();
        }

        // Method to get a motorcycle by its ID
        public async Task<Motorcycle> GetMotorcycleById(int motorcycleId)
        {
            return await _context.Motorcycles
                .Include(m => m.Photos) // ← include the photos
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.VehicleId == motorcycleId);
        }

        // Method to update an existing motorcycle
        public async Task UpdateMotorcycle(Motorcycle motorcycle)
        {
            var existingMotorcycle = await _context.Motorcycles.AsNoTracking()
                .FirstOrDefaultAsync(m => m.VehicleId == motorcycle.VehicleId);

            if (existingMotorcycle != null)
            {
                _context.Entry(existingMotorcycle).State = EntityState.Detached;
            }

            _context.Motorcycles.Update(motorcycle);
            await _context.SaveChangesAsync();
        }

        // Method to delete a motorcycle by its ID
        //public async Task DeleteMotorcycle(int motorcycleId)
        //{
        //    var motorcycle = await GetMotorcycleById(motorcycleId);
        //    if (motorcycle != null)
        //    {
        //        _context.Motorcycles.Remove(motorcycle);
        //        await _context.SaveChangesAsync();
        //    }
        //}

        // Method to get all motorcycles
        public async Task<IEnumerable<Motorcycle>> GetAllMotorcycles()
        {
            return await _context.Motorcycles
                .Include(m => m.Photos) // ← include here too
                .AsNoTracking()
                .ToListAsync();
        }

        // Method to get motorcycles by fuel type
        public async Task<IEnumerable<Motorcycle>> GetMotorcyclesByFuelType(string fuelType)
        {
            return await _context.Motorcycles.AsNoTracking()
                .Where(m => m.FuelType == fuelType)
                .ToListAsync();
        }

        // Method to get available motorcycles
        public async Task<IEnumerable<Motorcycle>> GetAvailableMotorcycles()
        {
            return await _context.Motorcycles.AsNoTracking()
                .Where(m => m.IsAvailable)
                .ToListAsync();
        }
    }
}
