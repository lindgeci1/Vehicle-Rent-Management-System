using VRMS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface IVehicleHistoryService
    {
        Task<VehicleHistoryDto> CreateVehicleHistory(VehicleHistoryDto vehicleHistoryDto);
        Task<List<VehicleHistoryDto>> GetAllVehicleHistories();
        Task<VehicleHistoryDto> GetVehicleHistoryById(Guid id);
        Task<VehicleHistoryDto> UpdateVehicleHistory(VehicleHistoryDto dto);
        Task DeleteVehicleHistory(Guid id);
        Task<VehicleHistoryDto> GetVehicleHistoryByVehicleId(int vehicleId);
    }
}
