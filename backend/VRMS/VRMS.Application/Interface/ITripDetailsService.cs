using VRMS.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface ITripDetailsService
    {
        // Method to create a new trip detail record
        Task<TripDetailsDto> CreateTripDetails(TripDetailsDto tripDetailsDto);

        // Method to get a trip detail by its ID
        Task<TripDetailsDto> GetTripDetailsById(int tripDetailsId);

        // Method to update an existing trip detail record
        Task<TripDetailsDto> UpdateTripDetails(TripDetailsDto tripDetailsDto);

        // Method to delete a trip detail by its ID
        Task DeleteTripDetails(int tripDetailsId);

        // Method to get all trip details
        Task<IEnumerable<TripDetailsDto>> GetAllTripDetails();
    }
}
