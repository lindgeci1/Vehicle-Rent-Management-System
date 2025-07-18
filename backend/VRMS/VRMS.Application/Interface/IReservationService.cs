using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VRMS.Application.Dtos;
using VRMS.Domain.Entities;

namespace VRMS.Application.Interface
{
    public interface IReservationService
    {
        Task<ReservationDto> CreateReservation(ReservationDto reservationDto);
        Task<ReservationDto> UpdateReservation(ReservationDto reservationDto);
        Task DeleteReservation(int reservationId);
        Task<ReservationDto> GetReservationById(int reservationId);
        Task<IEnumerable<ReservationDto>> GetAllReservations();
        Task<CustomerDto?> GetCustomerByReservationId(int reservationId);

        Task TogglePickedUp(int reservationId);
        Task ToggleBroughtBack(int reservationId);

        Task<IEnumerable<ReservationDto>> GetReservationsByCustomerId(int customerId);

        Task<List<string>> CheckAndResolveConflictsForToday();
    }
}
