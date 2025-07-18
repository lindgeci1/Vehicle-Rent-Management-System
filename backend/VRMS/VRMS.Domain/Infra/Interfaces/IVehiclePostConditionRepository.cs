using VRMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IVehiclePostConditionRepository
    {
        Task InsertVehiclePostCondition(VehiclePostCondition vehiclePostCondition);
        Task<VehiclePostCondition> GetVehiclePostConditionByVehicleId(int vehicleId);
        Task<VehiclePostCondition> GetVehiclePostConditionById(Guid id);
        Task<List<VehiclePostCondition>> GetAllVehiclePostConditions();
        Task UpdateVehiclePostCondition(VehiclePostCondition updatedPostCondition);
        Task DeleteVehiclePostCondition(Guid id);
        Task DeleteByVehicleId(int vehicleId);
    }
}
