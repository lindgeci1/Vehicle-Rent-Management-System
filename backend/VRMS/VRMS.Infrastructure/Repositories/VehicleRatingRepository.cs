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
    public class VehicleRatingRepository : IVehicleRatingRepository
    {
        private readonly IMongoCollection<VehicleRating> _vehicleRatingCollection;

        public VehicleRatingRepository(IOptions<MongoDbSettings> options)
        {
            var mongoClient = new MongoClient(options.Value.ConnectionString);
            _vehicleRatingCollection = mongoClient
                .GetDatabase(options.Value.DatabaseName)
                .GetCollection<VehicleRating>(options.Value.VehicleRatingCollection);
        }

        public async Task InsertVehicleRating(VehicleRating vehicleRating)
        {
            await _vehicleRatingCollection.InsertOneAsync(vehicleRating);
        }

        public async Task<VehicleRating> GetVehicleRatingById(Guid id)
        {
            return await _vehicleRatingCollection
                .Find(vr => vr.Id == id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<VehicleRating>> GetVehicleRatingsByVehicleId(int vehicleId)
        {
            return await _vehicleRatingCollection
                .Find(vr => vr.VehicleId == vehicleId)
                .ToListAsync();
        }

        public async Task<List<VehicleRating>> GetVehicleRatingsByCustomerId(int customerId)
        {
            return await _vehicleRatingCollection
                .Find(vr => vr.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<List<VehicleRating>> GetAllVehicleRatings()
        {
            return await _vehicleRatingCollection
                .Find(_ => true)
                .ToListAsync();
        }

        public async Task UpdateVehicleRating(VehicleRating updatedRating)
        {
            await _vehicleRatingCollection.ReplaceOneAsync(
                vr => vr.Id == updatedRating.Id,
                updatedRating);
        }

        public async Task DeleteVehicleRating(Guid id)
        {
            await _vehicleRatingCollection.DeleteOneAsync(vr => vr.Id == id);
        }
    }
}
