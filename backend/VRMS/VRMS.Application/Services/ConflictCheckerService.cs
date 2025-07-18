using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class ConflictCheckerService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public ConflictCheckerService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("✅ ConflictCheckerService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                Console.WriteLine($"🕒 ConflictCheckerService triggered at {DateTime.UtcNow:HH:mm:ss}");

                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var reservationService = scope.ServiceProvider.GetRequiredService<IReservationService>();
                    var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>();

                    var conflictLogs = await reservationService.CheckAndResolveConflictsForToday();
                    var availabilityLogs = await vehicleService.UpdateVehicleAvailabilityForToday();

                    foreach (var log in conflictLogs)
                        Console.WriteLine($"[ConflictLog] {log}");

                    foreach (var log in availabilityLogs)
                        Console.WriteLine($"[AvailabilityLog] {log}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Error in ConflictCheckerService: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            Console.WriteLine("🛑 ConflictCheckerService stopped.");
        }
    }
}
