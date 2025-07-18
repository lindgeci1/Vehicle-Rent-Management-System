using System;

namespace VRMS.Domain.Entities
{
    public class VehiclePostCondition
    {
        public VehiclePostCondition(Guid id, int vehicleId, bool hasScratches, string? scratchDescription,
                            bool hasDents, string? dentDescription,
                            bool hasRust, string? rustDescription, double totalCost, byte[] postConditionPdf)
        {
            Id = id;
            VehicleId = vehicleId;
            HasScratches = hasScratches;
            ScratchDescription = scratchDescription;
            HasDents = hasDents;
            DentDescription = dentDescription;
            HasRust = hasRust;
            RustDescription = rustDescription;
            TotalCost = totalCost;  
            CreatedAt = DateTime.UtcNow;
            PostConditionPdf = postConditionPdf;
        }

        public Guid Id { get; set; }  
        public int VehicleId { get; set; }  


        public bool HasScratches { get; set; }  
        public string? ScratchDescription { get; set; }  

        public bool HasDents { get; set; }     
        public string? DentDescription { get; set; }    

        public bool HasRust { get; set; }      
        public string? RustDescription { get; set; }    

        public double TotalCost { get; set; }  
        public DateTime CreatedAt { get; set; }
        public byte[]? PostConditionPdf { get; set; }
    }
}
