using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Infrastructure.Repositories
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly VRMSDbContext _context;

        public ReservationRepository(VRMSDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Reservation>> GetReservationsByStartDate(DateTime startDate)
        {
            return await _context.Reservations
                .Where(r => r.StartDate.Date == startDate)
                .ToListAsync();
        }
        public async Task<Reservation?> GetReservationByVehicleId(int vehicleId)
        {
            return await _context.Reservations
                .Where(r => r.VehicleId == vehicleId && r.BroughtBack) // or remove BroughtBack if needed
                .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task MarkReservationPickedUp(int reservationId)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if (reservation != null)
            {
                reservation.PickedUp = true;
                reservation.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkReservationBroughtBack(int reservationId)
        {
            var reservation = await _context.Reservations.FindAsync(reservationId);
            if (reservation != null)
            {
                reservation.BroughtBack = true;
                reservation.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddReservation(Reservation reservation)
        {
            await _context.Reservations.AddAsync(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task<Reservation> GetReservationById(int reservationId)
        {
            return await _context.Reservations.AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReservationId == reservationId);
        }

        public async Task UpdateReservation(Reservation reservation)
        {
            var existingReservation = await _context.Reservations.AsNoTracking()
                .FirstOrDefaultAsync(r => r.ReservationId == reservation.ReservationId);

            if (existingReservation != null)
            {
                _context.Entry(existingReservation).State = EntityState.Detached;
            }

            _context.Reservations.Update(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteReservation(int reservationId)
        {
            var reservation = await GetReservationById(reservationId);
            if (reservation != null)
            {
                var tracked = _context.ChangeTracker.Entries<Reservation>()
                    .FirstOrDefault(e => e.Entity.ReservationId == reservationId);

                if (tracked != null)
                    _context.Entry(tracked.Entity).State = EntityState.Detached;

                _context.Reservations.Remove(reservation);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Reservation>> GetAllReservations()
        {
            return await _context.Reservations.AsNoTracking().ToListAsync();
        }

        //public async Task<IEnumerable<Reservation>> GetReservationByVehicleId(int reservationId)
        //{
        //    return await _context.Reservation.AsNoTracking()
        //        .Where(r => r.VehicleId == reservationId)
        //        .ToListAsync();
        //}

        public async Task<bool> CustomerExists(int customerId)
        {
            return await _context.Customers
                .AsNoTracking()
                .AnyAsync(c => c.UserId == customerId);
        }

        public async Task<bool> VehicleExists(int vehicleId)
        {
            return await _context.Vehicles
                .AsNoTracking()
                .AnyAsync(v => v.VehicleId == vehicleId);
        }
        public async Task<Customer?> GetCustomerByReservationId(int reservationId)
        {
            return await _context.Reservations
                .Where(r => r.ReservationId == reservationId)
                .Select(r => r.Customer)
                .FirstOrDefaultAsync();
        }

        public async Task<Reservation?> GetReservationWithCustomerById(int reservationId)
        {
            return await _context.Reservations
                .Include(r => r.Customer)
                .FirstOrDefaultAsync(r => r.ReservationId == reservationId);
        }

    }
}
