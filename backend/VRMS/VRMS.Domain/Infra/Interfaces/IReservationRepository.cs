using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IReservationRepository
    {
        Task<IEnumerable<Reservation>> GetAllReservations();
        Task<Reservation> GetReservationById(int reservationId);
        Task AddReservation(Reservation reservation);
        Task UpdateReservation(Reservation reservation);
        Task DeleteReservation(int reservationId);
        Task<bool> CustomerExists(int customerId);
        Task<bool> VehicleExists(int vehicleId);
        Task<Customer?> GetCustomerByReservationId(int reservationId);
        Task<Reservation?> GetReservationWithCustomerById(int reservationId);
        Task<IEnumerable<Reservation>> GetReservationsByStartDate(DateTime startDate);
        Task MarkReservationPickedUp(int reservationId);
        Task MarkReservationBroughtBack(int reservationId);
        Task<Reservation?> GetReservationByVehicleId(int vehicleId);
    }
}
