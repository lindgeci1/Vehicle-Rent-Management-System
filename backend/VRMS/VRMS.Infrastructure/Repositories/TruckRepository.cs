using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class TruckRepository : ITruckRepository
    {
        private readonly VRMSDbContext _context;

        public TruckRepository(VRMSDbContext context)
        {
            _context = context;
        }

        /*───────────────────────────────*
         *  CREATE                       *
         *───────────────────────────────*/
        public async Task AddTruck(Truck truck)
        {
            await _context.Trucks.AddAsync(truck);
            await _context.SaveChangesAsync();
        }

        /*───────────────────────────────*
         *  READ – BY ID                 *
         *───────────────────────────────*/
        public async Task<Truck> GetTruckById(int truckId)
        {
            return await _context.Trucks
                .Include(t => t.Photos)   // include photos if applicable
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.VehicleId == truckId);
        }

        /*───────────────────────────────*
         *  UPDATE                       *
         *───────────────────────────────*/
        public async Task UpdateTruck(Truck truck)
        {
            var existingTruck = await _context.Trucks.AsNoTracking()
                .FirstOrDefaultAsync(t => t.VehicleId == truck.VehicleId);

            if (existingTruck != null)
                _context.Entry(existingTruck).State = EntityState.Detached;

            _context.Trucks.Update(truck);
            await _context.SaveChangesAsync();
        }

        /*───────────────────────────────*
         *  READ – LISTS                 *
         *───────────────────────────────*/
        public async Task<IEnumerable<Truck>> GetAllTrucks()
        {
            return await _context.Trucks
                .Include(t => t.Photos)   // include photos if applicable
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Truck>> GetTrucksByFuelType(string fuelType)
        {
            return await _context.Trucks
                .Include(t => t.Photos)
                .AsNoTracking()
                .Where(t => t.FuelType == fuelType)
                .ToListAsync();
        }

        public async Task<IEnumerable<Truck>> GetAvailableTrucks()
        {
            return await _context.Trucks
                .Include(t => t.Photos)
                .AsNoTracking()
                .Where(t => t.IsAvailable)
                .ToListAsync();
        }
    }
}
