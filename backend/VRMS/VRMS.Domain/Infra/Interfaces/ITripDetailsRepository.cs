using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface ITripDetailsRepository
    {
        // Method to add a new trip detail
        Task AddTripDetails(TripDetails tripDetails);

        // Method to get a trip detail by its ID
        Task<TripDetails> GetTripDetailsById(int tripDetailsId);

        // Method to update an existing trip detail
        Task UpdateTripDetails(TripDetails tripDetails);

        // Method to delete a trip detail by its ID
        Task DeleteTripDetails(int tripDetailsId);

        // Method to get all trip details
        Task<IEnumerable<TripDetails>> GetAllTripDetails();
        Task<IEnumerable<TripDetails>> GetTripDetailsByVehicleId(int vehicleId);

        Task<bool> DeleteTripDetailsAsync(int tripDetailsId);

    }
}
