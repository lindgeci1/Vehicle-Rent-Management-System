using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class BusRepository : IBusRepository
    {
        private readonly VRMSDbContext _context;

        public BusRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Method to add a new bus
        public async Task AddBus(Bus bus)
        {
            await _context.Buses.AddAsync(bus);
            await _context.SaveChangesAsync();
        }

        // Method to get a bus by its ID
        public async Task<Bus> GetBusById(int busId)
        {
            return await _context.Buses
                .Include(b => b.Photos)        // include photos if applicable
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.VehicleId == busId);
        }

        // Method to update an existing bus
        public async Task UpdateBus(Bus bus)
        {
            var existingBus = await _context.Buses.AsNoTracking()
                .FirstOrDefaultAsync(b => b.VehicleId == bus.VehicleId);

            if (existingBus != null)
            {
                _context.Entry(existingBus).State = EntityState.Detached;
            }

            _context.Buses.Update(bus);
            await _context.SaveChangesAsync();
        }

        // Method to get all buses
        public async Task<IEnumerable<Bus>> GetAllBuses()
        {
            return await _context.Buses
                .Include(b => b.Photos)        // include photos if applicable
                .AsNoTracking()
                .ToListAsync();
        }

        // Method to get buses by fuel type
        public async Task<IEnumerable<Bus>> GetBusesByFuelType(string fuelType)
        {
            return await _context.Buses.AsNoTracking()
                .Where(b => b.FuelType == fuelType)
                .ToListAsync();
        }

        // Method to get available buses
        public async Task<IEnumerable<Bus>> GetAvailableBuses()
        {
            return await _context.Buses.AsNoTracking()
                .Where(b => b.IsAvailable)
                .ToListAsync();
        }
    }
}
