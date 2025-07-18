using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Dtos
{
    public class VehiclePostConditionDto
    {
        public VehiclePostConditionDto() { }

        public VehiclePostConditionDto(VehiclePostCondition postCondition)
        {
            Id = postCondition.Id;
            VehicleId = postCondition.VehicleId;
            CreatedAt = postCondition.CreatedAt;
            HasScratches = postCondition.HasScratches;
            ScratchDescription = postCondition.ScratchDescription;
            HasDents = postCondition.HasDents;
            DentDescription = postCondition.DentDescription;
            HasRust = postCondition.HasRust;
            RustDescription = postCondition.RustDescription;
            TotalCost = postCondition.TotalCost;
            PostConditionPdf = postCondition.PostConditionPdf;
        }

        public Guid Id { get; set; }
        public int VehicleId { get; set; }
        public DateTime CreatedAt { get; set; }

        public bool HasScratches { get; set; }
        public string? ScratchDescription { get; set; }

        public bool HasDents { get; set; }
        public string? DentDescription { get; set; }

        public bool HasRust { get; set; }
        public string? RustDescription { get; set; }

        public double TotalCost { get; set; }
        public byte[]? PostConditionPdf { get; set; }
    }
}
