using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using System.Threading.Tasks;
using VRMS.Application.Interface;

public class VehicleAvailabilityStartupService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;

    public VehicleAvailabilityStartupService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>();
        //Console.WriteLine("[VehicleAvailability] 🔄 Startup service");

        List<string> logs = await vehicleService.UpdateVehicleAvailabilityForToday();
        foreach (var log in logs)
        {
            //Console.WriteLine(log); // ✅ print each update log with timestamp
        }
        //Console.WriteLine("[VehicleAvailability] Startup service: Update completed.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
