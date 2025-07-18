using VRMS.Domain.Entities;

namespace VRMS.Application.Dtos
{
    public class TripDetailsDto
    {
        // Parameterless constructor for potential deserialization
        public TripDetailsDto() { }

        // Constructor that maps the TripDetails entity to the DTO
        public TripDetailsDto(TripDetails tripDetails)
        {
            TripDetailsId = tripDetails.TripDetailsId;
            VehicleId = tripDetails.VehicleId;
            DaysTaken = tripDetails.DaysTaken;
            DistanceTraveled = tripDetails.DistanceTraveled;
            TotalCost = tripDetails.TotalCost;
        }

        // The properties you want to expose via the DTO
        public int TripDetailsId { get; set; }
        public int VehicleId { get; set; }
        public int DaysTaken { get; set; }
        public decimal DistanceTraveled { get; set; }
        public decimal TotalCost { get; set; }
    }
}
