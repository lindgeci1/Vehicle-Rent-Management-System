using VRMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IVehiclePreConditionRepository
    {
        Task InsertVehiclePreCondition(VehiclePreCondition vehiclePreCondition);
        Task<VehiclePreCondition> GetVehiclePreConditionByVehicleId(int vehicleId);
        Task<VehiclePreCondition> GetVehiclePreConditionById(Guid id);
        Task<List<VehiclePreCondition>> GetAllVehiclePreConditions();
        Task UpdateVehiclePreCondition(VehiclePreCondition updatedPreCondition);
        Task DeleteVehiclePreCondition(Guid id);

        Task DeleteByVehicleId(int vehicleId);

    }
}
