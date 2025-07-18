using VRMS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface IVehiclePostConditionService
    {
        Task<VehiclePostConditionDto> CreateVehiclePostCondition(VehiclePostConditionDto dto);
        Task<List<VehiclePostConditionDto>> GetAllVehiclePostConditions();
        Task<VehiclePostConditionDto> GetVehiclePostConditionById(Guid id);
        //Task<VehiclePostConditionDto> UpdateVehiclePostCondition(VehiclePostConditionDto dto);
        Task DeleteVehiclePostCondition(Guid id);

        Task<VehiclePostConditionDto> GetVehiclePostConditionByVehicleId(int vehicleId);
        Task<string> GetCustomerUsernameByPreConditionId(Guid preConditionId);
    }
}
