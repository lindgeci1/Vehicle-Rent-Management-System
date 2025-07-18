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
    public class PaymentCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public PaymentCleanupService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            TimeSpan expiryThreshold = TimeSpan.FromMinutes(30);

            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var paymentRepo = scope.ServiceProvider.GetRequiredService<IPaymentRepository>();
                var reservationRepo = scope.ServiceProvider.GetRequiredService<IReservationRepository>();
                var vehicleService = scope.ServiceProvider.GetRequiredService<IVehicleService>(); // ✅ resolved inside scope

                var now = DateTime.UtcNow;
                var lowerBound = now - expiryThreshold.Add(TimeSpan.FromSeconds(1));
                var upperBound = now - expiryThreshold.Add(TimeSpan.FromSeconds(-1));

                var expiredPayments = await paymentRepo.GetPendingPaymentsInWindowAsync(lowerBound, upperBound);

                foreach (var payment in expiredPayments)
                {
                    var createdAt = payment.Reservation.CreatedAt;
                    var age = now - createdAt;

                    await reservationRepo.DeleteReservation(payment.ReservationId);
                    await paymentRepo.DeletePaymentAsync(payment.PaymentId);

                    Console.WriteLine($"🧹 Deleted Payment #{payment.PaymentId} and Reservation #{payment.ReservationId} " +
                        $"created at {createdAt:HH:mm:ss} (age: {Math.Floor(age.TotalMinutes)} min {age.Seconds} sec).");

                    // ✅ Update availability
                    var updateLogs = await vehicleService.UpdateVehicleAvailabilityForToday();
                    foreach (var log in updateLogs)
                    {
                        Console.WriteLine(log);
                    }

                    // ✅ Send cancellation email
                    var customerService = scope.ServiceProvider.GetRequiredService<ICustomerService>();
                    var vehicleRepo = scope.ServiceProvider.GetRequiredService<IVehicleRepository>();
                    var emailService = new EmailTemplate();

                    var customer = await customerService.GetCustomerById(payment.Reservation.CustomerId);
                    var vehicle = await vehicleRepo.GetVehicleById(payment.Reservation.VehicleId);

                    if (customer != null && vehicle != null)
                    {
                            _ = Task.Run(async () =>
                            {
                                await emailService.SendReservationExpiredEmail(
                                customer.Email,
                                customer.Username,
                                vehicle.Mark,
                                vehicle.Model
                            );
                        });
                    }
                }


                await Task.Delay(TimeSpan.FromSeconds(1), stoppingToken);
            }
        }
    }
}
