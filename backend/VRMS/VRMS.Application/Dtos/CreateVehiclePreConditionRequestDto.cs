// VRMS.Application.Dtos/CreateVehiclePreConditionRequestDto.cs
namespace VRMS.Application.Dtos
{
    public sealed record CreateVehiclePreConditionRequestDto
    {
        public int VehicleId { get; set; }
        public bool HasScratches { get; set; }
        public string? ScratchDescription { get; set; }
        public bool HasDents { get; set; }
        public string? DentDescription { get; set; }
        public bool HasRust { get; set; }
        public string? RustDescription { get; set; }
    }
}
