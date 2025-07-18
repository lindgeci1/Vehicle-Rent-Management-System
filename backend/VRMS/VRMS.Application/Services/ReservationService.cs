using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;
using VRMS.Application.Interface;
using VRMS.Infrastructure.Repositories;
using Stripe;
using VRMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace VRMS.Application.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IVehicleService _vehicleService;
        private readonly IVehicleRepository _vehicleRepository;
        private readonly IPaymentService _paymentService;
        private readonly ICustomerService _customerService;
        private readonly ITripDetailsRepository _tripDetailsRepository;
        private readonly PriceService _priceService;
        private readonly IVehicleHistoryRepository _vehicleHistoryRepository;
        IPaymentRepository paymentRepository;
        private readonly VRMSDbContext _db;
        public ReservationService(
            IReservationRepository reservationRepository,
            ICustomerRepository customerRepository,
            IVehicleService vehicleService,
            IVehicleRepository vehicleRepository,
            IPaymentService paymentService,
            ICustomerService customerService,
            ITripDetailsRepository tripDetailsRepository,
            PriceService priceService,
            IPaymentRepository paymentRepository,
             VRMSDbContext dbContext,
             IVehicleHistoryRepository vehicleHistoryRepository)
        {
            _reservationRepository = reservationRepository;
            _customerRepository = customerRepository;
            _vehicleService = vehicleService;
            _vehicleRepository = vehicleRepository;
            _paymentService = paymentService;
            _customerService = customerService;
            _tripDetailsRepository = tripDetailsRepository;
            _priceService = priceService;
            this.paymentRepository = paymentRepository;
            _db = dbContext;
            _vehicleHistoryRepository = vehicleHistoryRepository;
        }


        public async Task<ReservationDto> CreateReservation(ReservationDto reservationDto)
        {
            if (reservationDto == null)
                throw new ArgumentException("Reservation cannot be null.");

            reservationDto.StartDate = reservationDto.StartDate.Date;
            reservationDto.EndDate = reservationDto.EndDate.Date;

            if (reservationDto.EndDate <= reservationDto.StartDate)
                throw new ArgumentException("End date must be after start date.");

            if (!Enum.IsDefined(typeof(ReservationStatus), reservationDto.Status))
                throw new ArgumentException("Invalid reservation status.");

            if (reservationDto.CustomerId <= 0)
                throw new ArgumentException("Customer ID must be greater than 0.");

            if (reservationDto.VehicleId <= 0)
                throw new ArgumentException("Vehicle ID must be greater than 0.");

            var customerExists = await _reservationRepository.CustomerExists(reservationDto.CustomerId);
            if (!customerExists)
                throw new ArgumentException("Customer with the given ID does not exist.");

            var vehicleExists = await _reservationRepository.VehicleExists(reservationDto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the given ID does not exist.");

            var isCustomer = await _customerRepository.CustomerExistsByUserId(reservationDto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Reservation can only be assigned to customers.");

            var allReservations = await _reservationRepository.GetAllReservations();

            // ❗ Check if customer has a reservation that overlaps the new one
            bool customerConflict = allReservations.Any(r =>
                r.CustomerId == reservationDto.CustomerId &&
                r.StartDate <= reservationDto.EndDate &&
                r.EndDate >= reservationDto.StartDate);

            if (customerConflict)
                throw new ArgumentException("This customer already has a reservation that overlaps with the selected dates.");

            // ❗ Check if vehicle has a reservation that overlaps the new one
            bool vehicleConflict = allReservations.Any(r =>
                r.VehicleId == reservationDto.VehicleId &&
                r.StartDate <= reservationDto.EndDate &&
                r.EndDate >= reservationDto.StartDate);

            if (vehicleConflict)
                throw new ArgumentException("This vehicle is already reserved for the selected dates.");

            var reservation = new Reservation(
                reservationDto.ReservationId,
                reservationDto.CustomerId,
                reservationDto.VehicleId,
                reservationDto.StartDate,
                reservationDto.EndDate,
                ReservationStatus.Pending // Force to Pending
            )
            {
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            await _reservationRepository.AddReservation(reservation);
                var logs = await _vehicleService.UpdateVehicleAvailabilityForToday();
                Console.WriteLine("[VehicleAvailability] Reservation created");
                foreach (var log in logs)
                {
                    Console.WriteLine(log);
                }

            var user = await _customerService.GetCustomerById(reservationDto.CustomerId);
            if (user == null)
                throw new ArgumentException("User associated with the Customer ID does not exist.");
            var vehicle = await _vehicleService.GetVehicleById(reservationDto.VehicleId);
            if (vehicle == null)
                throw new ArgumentException("Vehicle associated with the Vehicle ID does not exist.");

            var username = user.Username;
            var email = user.Email;
            var vehicleBrand = vehicle.Mark;
            var vehicleModel = vehicle.Model;
            var paymentRequest = new CreatePaymentIntentRequestDto
            {
                ReservationId = reservation.ReservationId,
                Description = $"Prepayment for {vehicleBrand}{vehicleModel}"
            };
            var stopwatch = Stopwatch.StartNew();
            await _paymentService.CreatePaymentIntentAsync(paymentRequest);

            Console.WriteLine($"⏱ Stripe Payment Intent creation took: {stopwatch.ElapsedMilliseconds} ms");

            stopwatch.Restart();

            _ = Task.Run(async () =>
            {
                var emailService = new EmailTemplate();
                await emailService.SendReservationConfirmationEmail(
                    email, username, reservation.ReservationId, vehicleBrand, vehicleModel);
            });

            Console.WriteLine($"📧 Email sending took: {stopwatch.ElapsedMilliseconds} ms");
            stopwatch.Restart();
            //Console.WriteLine($"✅ Reservation successful. Email sent to {user.Email}");
            return new ReservationDto(reservation);
        }


        public async Task<ReservationDto> GetReservationById(int reservationId)
        {
            var reservation = await _reservationRepository.GetReservationById(reservationId);
            return reservation != null ? new ReservationDto(reservation) : null;
        }

        public async Task<ReservationDto> UpdateReservation(ReservationDto reservationDto)
        {
            if (reservationDto == null)
                throw new ArgumentException("Reservation cannot be null.");

            reservationDto.StartDate = reservationDto.StartDate.Date;
            reservationDto.EndDate = reservationDto.EndDate.Date;

            if (reservationDto.StartDate == default)
                throw new ArgumentException("Start date must be a valid date.");

            if (reservationDto.EndDate == default)
                throw new ArgumentException("End date must be a valid date.");

            if (reservationDto.StartDate >= reservationDto.EndDate)
                throw new ArgumentException("Start date must be before end date.");

            if (!Enum.IsDefined(typeof(ReservationStatus), reservationDto.Status))
                throw new ArgumentException("Invalid reservation status.");

            if (reservationDto.CustomerId <= 0)
                throw new ArgumentException("Customer ID must be greater than 0.");

            if (reservationDto.VehicleId <= 0)
                throw new ArgumentException("Vehicle ID must be greater than 0.");

            var customerExists = await _reservationRepository.CustomerExists(reservationDto.CustomerId);
            if (!customerExists)
                throw new ArgumentException("Customer with the given ID does not exist.");

            var vehicleExists = await _reservationRepository.VehicleExists(reservationDto.VehicleId);
            if (!vehicleExists)
                throw new ArgumentException("Vehicle with the given ID does not exist.");

            var existingReservation = await _reservationRepository.GetReservationById(reservationDto.ReservationId);
            if (existingReservation == null)
                throw new ArgumentException("Reservation not found.");

            var allReservations = await _reservationRepository.GetAllReservations();

            // ✅ Check for overlapping reservations (excluding current one)
            bool customerConflict = allReservations.Any(r =>
                r.ReservationId != reservationDto.ReservationId &&
                r.CustomerId == reservationDto.CustomerId &&
                r.StartDate <= reservationDto.EndDate &&
                r.EndDate >= reservationDto.StartDate);

            if (customerConflict)
                throw new ArgumentException("This customer already has a reservation that overlaps with the selected dates.");

            bool vehicleConflict = allReservations.Any(r =>
                r.ReservationId != reservationDto.ReservationId &&
                r.VehicleId == reservationDto.VehicleId &&
                r.StartDate <= reservationDto.EndDate &&
                r.EndDate >= reservationDto.StartDate);

            if (vehicleConflict)
                throw new ArgumentException("This vehicle is already reserved for the selected dates.");

            var isCustomer = await _customerRepository.CustomerExistsByUserId(reservationDto.CustomerId);
            if (!isCustomer)
                throw new ArgumentException("Reservation can only be assigned to customers.");
            var updatedReservation = new Reservation(
                reservationDto.ReservationId,
                reservationDto.CustomerId,
                reservationDto.VehicleId,
                reservationDto.StartDate,
                reservationDto.EndDate,
                reservationDto.Status
            )
            {
                CreatedAt = existingReservation.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            };

            await _reservationRepository.UpdateReservation(updatedReservation);
                var logs = await _vehicleService.UpdateVehicleAvailabilityForToday();
                Console.WriteLine("[VehicleAvailability] Reservation updated");
                foreach (var log in logs)
                {
                    Console.WriteLine(log);
                }
            return new ReservationDto(updatedReservation);
        }

        public async Task DeleteReservation(int reservationId)
        {
            var existingReservation = await _reservationRepository.GetReservationById(reservationId);
            if (existingReservation == null)
                throw new ArgumentException("Reservation not found.");

            //int vehicleId = existingReservation.VehicleId;
            //// ✅ Delete all TripDetails for the vehicle
            //var tripDetails = await _tripDetailsRepository.GetTripDetailsByVehicleId(vehicleId);
            //if (tripDetails.Any())
            //{
            //    foreach (var trip in tripDetails)
            //    {
            //        await _tripDetailsRepository.DeleteTripDetails(trip.TripDetailsId);
            //        Console.WriteLine($"🗑️ TripDetails ID {trip.TripDetailsId} deleted for Vehicle #{vehicleId}");
            //    }
            //}
            await _reservationRepository.DeleteReservation(reservationId);

                var logs = await _vehicleService.UpdateVehicleAvailabilityForToday();
                Console.WriteLine("[VehicleAvailability] Reservation Deleted");
                foreach (var log in logs)
                {
                    Console.WriteLine(log);
                }
        }

        // Get all reservations
        public async Task<IEnumerable<ReservationDto>> GetAllReservations()
        {
            var reservationList = await _reservationRepository.GetAllReservations();
            return reservationList.Select(r => new ReservationDto(r));
        }
        public async Task<CustomerDto?> GetCustomerByReservationId(int reservationId)
        {
            var customer = await _reservationRepository.GetCustomerByReservationId(reservationId);
            return customer != null ? new CustomerDto(customer) : null;
        }
        public async Task TogglePickedUp(int reservationId)
        {
            var reservation = await _reservationRepository.GetReservationById(reservationId)
                              ?? throw new ArgumentException("Reservation not found.");

            if (reservation.PickedUp)
                throw new InvalidOperationException("Vehicle has already been picked up for this reservation.");

            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time"));
            if (localNow.Date < reservation.StartDate.Date || localNow.Date > reservation.EndDate.Date)
                throw new InvalidOperationException(
                    $"Pickup is only allowed between {reservation.StartDate:yyyy-MM-dd} and {reservation.EndDate:yyyy-MM-dd}.");

            reservation.PickedUp = true;
            reservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateReservation(reservation);
            var history = await _vehicleHistoryRepository.GetVehicleHistoryByVehicleId(reservation.VehicleId);
            if (history != null)
            {
                history.NumberOfDrivers += 1;
                history.UpdatedAt = DateTime.UtcNow;
                await _vehicleHistoryRepository.UpdateVehicleHistory(history);
            }

            var existingTrips = await _tripDetailsRepository.GetTripDetailsByVehicleId(reservation.VehicleId);
            if (!existingTrips.Any())
            {
                Console.WriteLine($"🗓 Reservation range: {reservation.StartDate} to {reservation.EndDate}");
                Console.WriteLine($"Calculated TotalDays: {(reservation.EndDate - reservation.StartDate).TotalDays}");
                var vehicle = await _vehicleService.GetVehicleById(reservation.VehicleId)
                              ?? throw new Exception("Vehicle not found.");

                int daysTaken = (int)Math.Ceiling((reservation.EndDate - reservation.StartDate).TotalDays);
                Console.WriteLine($"📦 Calculated trip duration: {daysTaken} days (Start: {reservation.StartDate}, End: {reservation.EndDate})");


                //decimal dailyFee = _priceService.CalculateDailyPayment(vehicle.Category, vehicle.Mark, vehicle.Year);
                //decimal totalCost = daysTaken * dailyFee;

                var tripDetails = new TripDetails(
                    tripDetailsId: 0,
                    vehicleId: reservation.VehicleId,
                    daysTaken: 0,
                    distanceTraveled: 0,
                    totalCost: 0
                );

                await _tripDetailsRepository.AddTripDetails(tripDetails);
                Console.WriteLine($"✅ TripDetails created immediately after pickup for Reservation #{reservation.ReservationId}");
                await _vehicleService.UpdateVehicleAvailabilityForToday();
            }
        }



        public async Task ToggleBroughtBack(int reservationId)
        {
            var reservation = await _reservationRepository.GetReservationById(reservationId)
                              ?? throw new ArgumentException("Reservation not found.");

            if (reservation.BroughtBack)
                throw new InvalidOperationException("Vehicle has already been brought back for this reservation.");

            var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time"));
            var today = localNow.Date;

            //// Validation: Ensure current date is within StartDate and EndDate
            //if (today < reservation.StartDate.Date || today > reservation.EndDate.Date)
            //    throw new InvalidOperationException($"Return is only allowed between {reservation.StartDate:yyyy-MM-dd} and {reservation.EndDate:yyyy-MM-dd}.");

            // Validation: Ensure vehicle was picked up first
            if (!reservation.PickedUp)
                throw new InvalidOperationException("Vehicle must be picked up before it can be brought back.");

            reservation.BroughtBack = true;
            reservation.UpdatedAt = DateTime.UtcNow;
            await _reservationRepository.UpdateReservation(reservation);

            // ✅ Call paymentService to create final Stripe payment
            //await _paymentService.CreateFinalPaymentForReservationAsync(reservationId);

            var gpsRows = await _db.VehicleGpsHistories
                               .Where(g => g.VehicleId == reservation.VehicleId)
                               .ToListAsync();
            _db.VehicleGpsHistories.RemoveRange(gpsRows);
            await _db.SaveChangesAsync();

            GpsSimulator.ClearVehicle(reservation.VehicleId);

            var vehicle = await _vehicleService.GetVehicleById(reservation.VehicleId)
                          ?? throw new Exception("Vehicle not found.");

            var existingTrips = await _tripDetailsRepository.GetTripDetailsByVehicleId(reservation.VehicleId);
            var trip = existingTrips.OrderByDescending(t => t.TripDetailsId).FirstOrDefault();
            if (trip == null)
                throw new Exception("TripDetails record not found for update.");

            trip.DaysTaken = Math.Max(1, (int)Math.Ceiling((today - reservation.StartDate.Date).TotalDays));
            trip.TotalCost = trip.DaysTaken * _priceService.CalculateDailyPayment(vehicle.Category, vehicle.Mark, vehicle.Year);

            await _tripDetailsRepository.UpdateTripDetails(trip);
            Console.WriteLine($"✅ TripDetails updated at return | Days: {trip.DaysTaken}, €{trip.TotalCost}");
            await _vehicleService.UpdateVehicleAvailabilityForToday();

        }

        public async Task<IEnumerable<ReservationDto>> GetReservationsByCustomerId(int customerId)
        {
            var allReservations = await _reservationRepository.GetAllReservations();
            var userReservations = allReservations
                .Where(r => r.CustomerId == customerId)
                .Select(r => new ReservationDto(r));

            return userReservations;
        }
        public async Task<List<string>> CheckAndResolveConflictsForToday()
        {
            var logs = new List<string>();
            var today = DateTime.UtcNow.Date;
            var allReservations = await _reservationRepository.GetAllReservations();
            //var reservationsStartingToday = allReservations
            //    .Where(r => r.StartDate.Date == today)
            //    .ToList();
            var reservationsStartingToday = allReservations
                .Where(r => r.StartDate.Date == today && (int)r.Status == 1) // Reserved
                .ToList();

            foreach (var res in reservationsStartingToday)
            {
                var vehicle = await _vehicleRepository.GetVehicleById(res.VehicleId);
                var previousReservation = allReservations
                    .FirstOrDefault(r =>
                        r.VehicleId == res.VehicleId &&
                        r.ReservationId != res.ReservationId &&
                        r.PickedUp &&
                        !r.BroughtBack);

                if (previousReservation != null)
                {
                    previousReservation.IsLate = true;
                    previousReservation.LateDays = (today - previousReservation.EndDate.Date).Days;
                    await _reservationRepository.UpdateReservation(previousReservation);
                    logs.Add($"🚨 Conflict: Vehicle {res.VehicleId} still not returned. Reservation {previousReservation.ReservationId} marked late.");

                    // ✅ Pass vehicle.Year now
                    var replacement = await _vehicleService.FindSimilarAvailableVehicle(
                        vehicle.Category, vehicle.Mark, vehicle.Year, today, res.EndDate);

                    if (replacement != null)
                    {
                        Console.WriteLine($"✅ Candidate Replacement Found: VehicleId={replacement.VehicleId}, Mark={replacement.Mark}, Category={replacement.Category}, Year={replacement.Year}");
                        Console.WriteLine($"⛔ Previous Reservation VehicleId={previousReservation.VehicleId}");

                        if (replacement.VehicleId != previousReservation.VehicleId)
                        {
                            res.VehicleId = replacement.VehicleId;
                            await _reservationRepository.UpdateReservation(res);
                            logs.Add($"🔁 Reservation {res.ReservationId} reassigned to Vehicle {replacement.VehicleId}.");
                            var user = await _customerService.GetCustomerById(res.CustomerId); // or however you get the user
                            var emailService = new EmailTemplate(); // or inject it via constructor if using DI
                            string oldVehicle = $"{vehicle.Mark} {vehicle.Model}";
                            string newVehicle = $"{replacement.Mark} {replacement.Model}";
                            await emailService.SendVehicleReassignmentEmail(user.Email, user.Username, res.ReservationId, oldVehicle, newVehicle);
                        }
                        else
                        {
                            res.Status = ReservationStatus.Conflict;
                            await _reservationRepository.UpdateReservation(res);
                            logs.Add($"❌ Replacement vehicle is same as in-use vehicle. Reservation {res.ReservationId} marked as conflict.");
                            // ─── REFUND CALL HERE ───
                            //await _paymentService.RefundReservationAsync(res.ReservationId);
                            //var user = await _customerService.GetCustomerById(res.CustomerId);
                            //await new EmailTemplate()
                            //    .SendRefundNotificationEmail(user.Email, user.Username, res.ReservationId);
                        }
                    }
                    else
                    {
                        Console.WriteLine("❌ No replacement vehicle found at all.");
                        res.Status = ReservationStatus.Conflict;
                        await _reservationRepository.UpdateReservation(res);
                        logs.Add($"❌ No replacement available for Reservation {res.ReservationId}. Marked as conflict.");

                        // ← HERE you call the refund:
                        await _paymentService.RefundReservationAsync(res.ReservationId);

                        // (then send the refund-notification email)
                        var user = await _customerService.GetCustomerById(res.CustomerId);
                        await new EmailTemplate()
                            .SendRefundNotificationEmail(user.Email, user.Username, res.ReservationId);
                    }
                }
            }

            return logs;
        }


    }
}