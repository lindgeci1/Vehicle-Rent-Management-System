using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class VehicleAvailabilityBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public VehicleAvailabilityBackgroundService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>();

                    var logs = await vehicleService.UpdateVehicleAvailabilityForToday();
                    if (!logs.Any())
                    {
                        //Console.WriteLine($"[{DateTime.Now}] No updates to vehicle availability.");
                    }
                    foreach (var log in logs)
                    {
                        //Console.WriteLine(log); // 🖨 Log every update
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ VehicleAvailabilityBackgroundService error: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // 🔁 Run every 1 minute
            }
        }

    }
}
