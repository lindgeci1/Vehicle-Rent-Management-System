using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VRMS.Infrastructure.Repositories
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly VRMSDbContext _context;

        public VehicleRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Get all vehicles
        public async Task<IEnumerable<Vehicle>> GetAllVehicles()
        {
            return await _context.Vehicles
                .Include(v => v.Photos)      // ← include photos here
                .AsNoTracking()
                .ToListAsync();
        }

        // Get a vehicle by ID
        public async Task<Vehicle> GetVehicleById(int vehicleId)
        {
            return await _context.Vehicles
                .Include(v => v.Photos)      // ← and include them here too
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);
        }

        // Delete a vehicle by ID
        public async Task DeleteVehicle(int vehicleId)
        {
            var vehicle = await GetVehicleById(vehicleId);
            if (vehicle != null)
            {
                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateVehicle(Vehicle vehicle)
        {
            _context.Vehicles.Update(vehicle);
            await _context.SaveChangesAsync();
        }

        public async Task AddPhoto(Photo photo)
        {
            await _context.Photos.AddAsync(photo);
            await _context.SaveChangesAsync();
        }
        public async Task DeletePhotosByVehicleId(int vehicleId)
        {
            var photos = await _context.Photos
                .Where(p => p.VehicleId == vehicleId)
                .ToListAsync();

            _context.Photos.RemoveRange(photos);
            await _context.SaveChangesAsync();
        }
        //public async Task<Vehicle> GetByIdWithPhotos(int vehicleId)
        //{
        //    return await _context.Vehicles
        //        .Include(v => v.Photos)
        //        .FirstOrDefaultAsync(v => v.VehicleId == vehicleId);
        //}

    }
}
