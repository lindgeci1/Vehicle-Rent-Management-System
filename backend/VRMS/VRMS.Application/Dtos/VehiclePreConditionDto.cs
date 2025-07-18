using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Dtos
{
    public class VehiclePreConditionDto
    {
        public VehiclePreConditionDto() { }

        public VehiclePreConditionDto(VehiclePreCondition preCondition)
        {
            Id = preCondition.Id;
            VehicleId = preCondition.VehicleId;
            CreatedAt = preCondition.CreatedAt;
            HasScratches = preCondition.HasScratches;
            ScratchDescription = preCondition.ScratchDescription;
            HasDents = preCondition.HasDents;
            DentDescription = preCondition.DentDescription;
            HasRust = preCondition.HasRust;
            RustDescription = preCondition.RustDescription;
            PreConditionPdf = preCondition.PreConditionPdf;
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
        public byte[]? PreConditionPdf { get; set; }
    }
}
