using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Dtos
{
    public class VehicleRatingDto
    {
        public VehicleRatingDto() { }

        public VehicleRatingDto(VehicleRating rating)
        {
            Id = rating.Id;
            CustomerId = rating.CustomerId;
            VehicleId = rating.VehicleId;
            RatingValue = rating.RatingValue;
            ReviewComment = rating.ReviewComment;
            CreatedAt = rating.CreatedAt;
        }

        public Guid Id { get; set; }
        public int CustomerId { get; set; }
        public int VehicleId { get; set; }
        public int RatingValue { get; set; }
        public string? ReviewComment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
