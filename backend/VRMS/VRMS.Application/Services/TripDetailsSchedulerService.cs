//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Hosting;
//using VRMS.Application.Interface;
//using VRMS.Domain.Entities;
//using VRMS.Domain.Infra.Interfaces;
//using AppPriceService = VRMS.Application.Services.PriceService;
//public class TripDetailsSchedulerService : BackgroundService
//{
//    private readonly IServiceScopeFactory _scopeFactory;

//    public TripDetailsSchedulerService(IServiceScopeFactory scopeFactory)
//    {
//        _scopeFactory = scopeFactory;
//    }

//    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//    {
//        while (!stoppingToken.IsCancellationRequested)
//        {
//            using var scope = _scopeFactory.CreateScope();

//            var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
//            var tripRepo = scope.ServiceProvider.GetRequiredService<ITripDetailsRepository>();
//            var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>();
//            var priceService = scope.ServiceProvider.GetRequiredService<AppPriceService>();

//            var allReservations = await reservationRepo.GetAllReservations();

//            var reservationsToProcess = allReservations
//                .Where(r => r.PickedUp && !r.BroughtBack && r.Status == ReservationStatus.Reserved);

//            foreach (var reservation in reservationsToProcess)
//            {
//                var existingTrips = await tripRepo.GetTripDetailsByVehicleId(reservation.VehicleId);
//                if (existingTrips.Any())
//                    continue;

//                var vehicle = await vehicleService.GetVehicleById(reservation.VehicleId);
//                if (vehicle == null)
//                    continue;

//                int daysTaken = (reservation.EndDate - reservation.StartDate).Days;
//                decimal dailyFee = priceService.CalculatePrepayFee(vehicle.Category, vehicle.Mark, vehicle.Year);
//                decimal totalCost = daysTaken * dailyFee;

//                var tripDetails = new TripDetails(
//                    tripDetailsId: 0,
//                    vehicleId: reservation.VehicleId,
//                    daysTaken: daysTaken,
//                    distanceTraveled: 0,
//                    totalCost: totalCost
//                );

//                await tripRepo.AddTripDetails(tripDetails);
//                Console.WriteLine($"✅ [TripScheduler] TripDetails created for Reservation #{reservation.ReservationId}, Vehicle #{vehicle.VehicleId}");
//            }

//            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
//        }
//    }

//}
