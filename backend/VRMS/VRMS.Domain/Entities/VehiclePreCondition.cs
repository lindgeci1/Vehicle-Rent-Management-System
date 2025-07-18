using System;

namespace VRMS.Domain.Entities
{
    public class VehiclePreCondition
    {
        public VehiclePreCondition(Guid id, int vehicleId, bool hasScratches, string? scratchDescription,
                                    bool hasDents, string? dentDescription,
                                    bool hasRust, string? rustDescription, byte[] preConditionPdf)
        {
            Id = id;
            VehicleId = vehicleId;
            HasScratches = hasScratches;
            ScratchDescription = scratchDescription;
            HasDents = hasDents;
            DentDescription = dentDescription;
            HasRust = hasRust;
            RustDescription = rustDescription;
            CreatedAt = DateTime.UtcNow;
            PreConditionPdf = preConditionPdf;
        }

        public Guid Id { get; set; }  
        public int VehicleId { get; set; } 
        public DateTime CreatedAt { get; set; }  


        public bool HasScratches { get; set; }
        public bool HasDents { get; set; }
        public bool HasRust { get; set; }


        public string? ScratchDescription { get; set; } 
        public string? DentDescription { get; set; }    
        public string? RustDescription { get; set; }

        public byte[]? PreConditionPdf { get; set; }

    }
}
