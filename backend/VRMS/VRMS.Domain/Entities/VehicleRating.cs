


using System;

namespace VRMS.Domain.Entities
{
    public class VehicleRating
    {
        public VehicleRating(Guid id, int customerId, int vehicleId, int ratingValue, string? reviewComment)
        {
            Id = id;
            CustomerId = customerId;
            VehicleId = vehicleId;
            RatingValue = ratingValue;
            ReviewComment = reviewComment;
            CreatedAt = DateTime.UtcNow;
        }

        public Guid Id { get; set; }
        public int CustomerId { get; set; }
        public int VehicleId { get; set; }
        public int RatingValue { get; set; }
        public string? ReviewComment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
