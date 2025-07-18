using VRMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IVehicleHistoryRepository
    {
        Task InsertVehicleHistory(VehicleHistory vehicleHistory);
        Task<VehicleHistory> GetVehicleHistoryByVehicleId(int vehicleId);
        Task<VehicleHistory> GetVehicleHistoryById(Guid id);
        Task<List<VehicleHistory>> GetAllVehicleHistories();
        Task UpdateVehicleHistory(VehicleHistory updatedHistory); // 👈 only the entity
        Task DeleteVehicleHistory(Guid id); // keep id here for deletion
    }
}
