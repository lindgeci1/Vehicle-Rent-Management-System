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
    public class VehiclePostConditionRepository : IVehiclePostConditionRepository
    {
        private readonly IMongoCollection<VehiclePostCondition> _vehiclePostConditionCollection;

        public VehiclePostConditionRepository(IOptions<MongoDbSettings> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            _vehiclePostConditionCollection = mongoClient
                .GetDatabase(options.Value.DatabaseName)
                .GetCollection<VehiclePostCondition>(options.Value.VehiclePostConditionCollection);
        }
        public async Task DeleteByVehicleId(int vehicleId)
        {
            await _vehiclePostConditionCollection.DeleteOneAsync(p => p.VehicleId == vehicleId);
        }

        public async Task InsertVehiclePostCondition(VehiclePostCondition vehiclePostCondition)
        {
            await _vehiclePostConditionCollection.InsertOneAsync(vehiclePostCondition);
        }

        public async Task<VehiclePostCondition> GetVehiclePostConditionByVehicleId(int vehicleId)
        {
            return await _vehiclePostConditionCollection
                .Find(vp => vp.VehicleId == vehicleId)
                .FirstOrDefaultAsync();
        }

        public async Task<VehiclePostCondition> GetVehiclePostConditionById(Guid id)
        {
            return await _vehiclePostConditionCollection
                .Find(vp => vp.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<VehiclePostCondition>> GetAllVehiclePostConditions()
        {
            return await _vehiclePostConditionCollection.Find(_ => true).ToListAsync();
        }

        public async Task UpdateVehiclePostCondition(VehiclePostCondition updatedPostCondition)
        {
            await _vehiclePostConditionCollection.ReplaceOneAsync(
                vp => vp.Id == updatedPostCondition.Id,
                updatedPostCondition);
        }

        public async Task DeleteVehiclePostCondition(Guid id)
        {
            await _vehiclePostConditionCollection.DeleteOneAsync(vp => vp.Id == id);
        }
    }
}
