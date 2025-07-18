using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class FinalPaymentCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public FinalPaymentCleanupService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();

                var paymentRepo = scope.ServiceProvider.GetRequiredService<IPaymentRepository>();
                var tripDetailsRepo = scope.ServiceProvider.GetRequiredService<ITripDetailsRepository>();
                var preRepo = scope.ServiceProvider.GetRequiredService<IVehiclePreConditionRepository>();
                var postRepo = scope.ServiceProvider.GetRequiredService<IVehiclePostConditionRepository>();
                var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();

                try
                {
                    var paidPayments = await paymentRepo.GetConfirmedPaymentsPendingCleanupAsync();

                    foreach (var payment in paidPayments)
                    {
                        var reservationId = payment.ReservationId;
                        var vehicleId = payment.Reservation.VehicleId;

                        // Cleanup Payments
                        var relatedPayments = await paymentRepo.GetPaymentsByReservationIdAsync(reservationId);
                        foreach (var p in relatedPayments)
                            await paymentRepo.DeletePaymentAsync(p.PaymentId);

                        // Cleanup Trip Details
                        var trips = await tripDetailsRepo.GetTripDetailsByVehicleId(vehicleId);
                        foreach (var trip in trips)
                            await tripDetailsRepo.DeleteTripDetailsAsync(trip.TripDetailsId);

                        // Cleanup Pre/Post Conditions
                        await preRepo.DeleteByVehicleId(vehicleId);
                        await postRepo.DeleteByVehicleId(vehicleId);
                        await reservationRepo.DeleteReservation(reservationId);

                        Console.WriteLine($"🧹 Cleanup complete for Reservation #{reservationId}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Cleanup error: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
