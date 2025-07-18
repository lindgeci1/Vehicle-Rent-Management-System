using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VRMS.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace VRMS.Infrastructure.Repositories
{
    public class VehiclePreConditionRepository : IVehiclePreConditionRepository
    {
        private readonly IMongoCollection<VehiclePreCondition> _vehiclePreConditionCollection;

        public VehiclePreConditionRepository(IOptions<MongoDbSettings> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            _vehiclePreConditionCollection = mongoClient
                .GetDatabase(options.Value.DatabaseName)
                .GetCollection<VehiclePreCondition>(options.Value.VehiclePreConditionCollection);
        }

        public async Task InsertVehiclePreCondition(VehiclePreCondition vehiclePreCondition)
        {
            await _vehiclePreConditionCollection.InsertOneAsync(vehiclePreCondition);
        }
        public async Task DeleteByVehicleId(int vehicleId)
        {
            await _vehiclePreConditionCollection.DeleteOneAsync(p => p.VehicleId == vehicleId);
        }

        public async Task<VehiclePreCondition> GetVehiclePreConditionByVehicleId(int vehicleId)
        {
            return await _vehiclePreConditionCollection
                .Find(vp => vp.VehicleId == vehicleId)
                .FirstOrDefaultAsync();
        }

        public async Task<VehiclePreCondition> GetVehiclePreConditionById(Guid id)
        {
            return await _vehiclePreConditionCollection
                .Find(vp => vp.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<VehiclePreCondition>> GetAllVehiclePreConditions()
        {
            return await _vehiclePreConditionCollection.Find(_ => true).ToListAsync();
        }

        public async Task UpdateVehiclePreCondition(VehiclePreCondition updatedPreCondition)
        {
            await _vehiclePreConditionCollection.ReplaceOneAsync(
                vp => vp.Id == updatedPreCondition.Id,
                updatedPreCondition);
        }

        public async Task DeleteVehiclePreCondition(Guid id)
        {
            await _vehiclePreConditionCollection.DeleteOneAsync(vp => vp.Id == id);
        }

    }
}
