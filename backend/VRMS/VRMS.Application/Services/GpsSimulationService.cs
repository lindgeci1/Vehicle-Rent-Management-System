using VRMS.Domain.Entities;
using backend.VRMS.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using VRMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VRMS.Domain.Infra.Interfaces;

namespace backend.VRMS.Services
{
    public class GpsSimulationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public GpsSimulationService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("🛰️ GPS Simulation Service Started...");

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<VRMSDbContext>();
                var historyRepo = scope.ServiceProvider.GetRequiredService<IVehicleHistoryRepository>();

                var activeVehicleIds = await db.Reservations
                    .Where(r => r.PickedUp && !r.BroughtBack)
                    .Select(r => r.VehicleId)
                    .Distinct()
                    .ToListAsync(stoppingToken);

                Console.WriteLine($"📡 Found {activeVehicleIds.Count} active vehicles for GPS tracking...");

                foreach (var vehicleId in activeVehicleIds)
                {
                    var hasGps = await db.VehicleGpsHistories
                        .AnyAsync(x => x.VehicleId == vehicleId);

                    double lat, lng;
                    if (!hasGps)
                    {
                        lat = 42.6486; // UBT Dukagjini latitude
                        lng = 21.1623; // UBT Dukagjini longitude
                        Console.WriteLine($"📍 Initializing Vehicle #{vehicleId} at UBT Dukagjini");
                    }
                    else
                    {
                        (lat, lng) = GpsSimulator.GetNextPoint(vehicleId);
                    }

                    db.VehicleGpsHistories.Add(new VehicleGpsHistory
                    {
                        VehicleId = vehicleId,
                        Latitude = lat,
                        Longitude = lng,
                        Timestamp = DateTime.UtcNow
                    });

                    Console.WriteLine($"✅ Inserted GPS point for Vehicle #{vehicleId} at [{lat}, {lng}]");
                }

                await db.SaveChangesAsync(stoppingToken);

                foreach (var vehicleId in activeVehicleIds)
                {
                    var recentPoints = await db.VehicleGpsHistories
                        .Where(x => x.VehicleId == vehicleId)
                        .OrderByDescending(x => x.Timestamp)
                        .Take(2)
                        .ToListAsync();

                    if (recentPoints.Count == 2)
                    {
                        var old = recentPoints[1];
                        var latest = recentPoints[0];
                        double distance = Haversine(old.Latitude, old.Longitude, latest.Latitude, latest.Longitude);

                        var trip = await db.TripDetails
                            .Where(t => t.VehicleId == vehicleId)
                            .OrderByDescending(t => t.TripDetailsId)
                            .FirstOrDefaultAsync();

                        if (trip != null)
                        {
                            var previousDistance = trip.DistanceTraveled;
                            trip.DistanceTraveled += (decimal)distance;
                            var addedDistance = trip.DistanceTraveled - previousDistance;

                            Console.WriteLine($"📡 Vehicle #{vehicleId} distance moved: {distance:F4} km");
                            Console.WriteLine($"📦 TripDetails: addedDistance = {addedDistance:F4} km");

                            var history = await historyRepo.GetVehicleHistoryByVehicleId(vehicleId);
                            if (history != null)
                            {
                                history.Km += distance;
                                history.UpdatedAt = DateTime.UtcNow;
                                await historyRepo.UpdateVehicleHistory(history);

                                Console.WriteLine($"✅ VehicleHistory.Km += {distance:F4} → total now: {history.Km:F4} km");
                            }

                            else
                            {
                                Console.WriteLine($"❌ VehicleHistory not found for Vehicle #{vehicleId}");
                            }
                        }


                    }

                }

                await db.SaveChangesAsync(stoppingToken);
                Console.WriteLine("💾 GPS Data saved to DB. Waiting 15 seconds...\n");

                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }

            Console.WriteLine("🛑 GPS Simulation Service stopped.");
        }

        private double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; // Radius of Earth in km
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double angle) => Math.PI * angle / 180.0;
    }
}