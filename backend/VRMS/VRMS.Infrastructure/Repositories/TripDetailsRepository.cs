using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class TripDetailsRepository : ITripDetailsRepository
    {
        private readonly VRMSDbContext _context;

        public TripDetailsRepository(VRMSDbContext context)
        {
            _context = context;
        }
        // Method to add new trip details
        public async Task AddTripDetails(TripDetails tripDetails)
        {
            await _context.TripDetails.AddAsync(tripDetails);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> DeleteTripDetailsAsync(int tripDetailsId)
        {
            var trip = await _context.TripDetails.FindAsync(tripDetailsId);
            if (trip == null) return false;

            _context.TripDetails.Remove(trip);
            await _context.SaveChangesAsync();
            return true;
        }

        // Method to get trip details by ID
        public async Task<TripDetails> GetTripDetailsById(int tripDetailsId)
        {
            return await _context.TripDetails.AsNoTracking()
                .FirstOrDefaultAsync(td => td.TripDetailsId == tripDetailsId);
        }

        // Method to update existing trip details
        public async Task UpdateTripDetails(TripDetails tripDetails)
        {
            var existingTrip = await _context.TripDetails.AsNoTracking()
                .FirstOrDefaultAsync(td => td.TripDetailsId == tripDetails.TripDetailsId);

            if (existingTrip != null)
            {
                _context.Entry(existingTrip).State = EntityState.Detached;
            }

            _context.TripDetails.Update(tripDetails);
            await _context.SaveChangesAsync();
        }

        // Method to delete trip details by ID
        public async Task DeleteTripDetails(int tripDetailsId)
        {
            var tripDetails = await GetTripDetailsById(tripDetailsId);
            if (tripDetails != null)
            {
                _context.TripDetails.Remove(tripDetails);
                await _context.SaveChangesAsync();
            }
        }

        // Method to get all trip details
        public async Task<IEnumerable<TripDetails>> GetAllTripDetails()
        {
            return await _context.TripDetails.AsNoTracking().ToListAsync();
        }

        // Method to get trip details by vehicle ID
        public async Task<IEnumerable<TripDetails>> GetTripDetailsByVehicleId(int vehicleId)
        {
            return await _context.TripDetails.AsNoTracking()
                .Where(td => td.VehicleId == vehicleId)
                .ToListAsync();
        }
    }
}
