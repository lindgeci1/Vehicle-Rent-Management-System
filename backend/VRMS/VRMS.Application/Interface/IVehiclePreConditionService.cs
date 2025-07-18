using VRMS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VRMS.Domain.Entities;

namespace VRMS.Application.Interface
{
    public interface IVehiclePreConditionService
    {
        Task<VehiclePreConditionDto> CreateVehiclePreCondition(CreateVehiclePreConditionRequestDto request);
        Task<List<VehiclePreConditionDto>> GetAllVehiclePreConditions();
        Task<VehiclePreConditionDto> GetVehiclePreConditionById(Guid id);
        Task<VehiclePreConditionDto> UpdateVehiclePreCondition(VehiclePreConditionDto dto);
        Task DeleteVehiclePreCondition(Guid id);
        Task<VehiclePreConditionDto> GetVehiclePreConditionByVehicleId(int vehicleId);

        Task<string> GetCustomerUsernameByPreConditionId(Guid preConditionId);
    }
}
