using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VRMS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Infrastructure.Repositories
{
    public class VehicleHistoryRepository : IVehicleHistoryRepository
    {
        private readonly IMongoCollection<VehicleHistory> _vehicleHistoryCollection;

        public VehicleHistoryRepository(IOptions<MongoDbSettings> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            _vehicleHistoryCollection = mongoClient
                .GetDatabase(options.Value.DatabaseName)
                .GetCollection<VehicleHistory>(options.Value.VehicleHistoryCollection);
        }

        public async Task InsertVehicleHistory(VehicleHistory vehicleHistory)
        {
            await _vehicleHistoryCollection.InsertOneAsync(vehicleHistory);
        }

        public async Task<VehicleHistory> GetVehicleHistoryByVehicleId(int vehicleId)
        {
            return await _vehicleHistoryCollection
                .Find(vh => vh.VehicleId == vehicleId)
                .FirstOrDefaultAsync();
        }

        public async Task<VehicleHistory> GetVehicleHistoryById(Guid id)
        {
            return await _vehicleHistoryCollection
                .Find(vh => vh.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<VehicleHistory>> GetAllVehicleHistories()
        {
            return await _vehicleHistoryCollection.Find(_ => true).ToListAsync();
        }

        public async Task UpdateVehicleHistory(VehicleHistory updatedHistory)
        {
            updatedHistory.UpdatedAt = DateTime.UtcNow; // always refresh on update
            await _vehicleHistoryCollection.ReplaceOneAsync(
                vh => vh.Id == updatedHistory.Id,
                updatedHistory);
        }

        public async Task DeleteVehicleHistory(Guid id)
        {
            await _vehicleHistoryCollection.DeleteOneAsync(vh => vh.Id == id);
        }
    }
}
