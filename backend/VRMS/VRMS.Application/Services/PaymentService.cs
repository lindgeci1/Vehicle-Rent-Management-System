using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.TestHelpers;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Repositories;

namespace VRMS.Application.Services
{
    public class PaymentService(PriceService priceService,IVehiclePostConditionRepository vehiclePostConditionRepository, IVehiclePreConditionRepository vehiclePreConditionRepository, IInsurancePolicyRepository iInsurancePolicyRepository,ITripDetailsRepository tripDetailsRepository, IPaymentRepository paymentRepository, IVehicleRepository _vehicleRepository, ICustomerRepository _customerRepository,IReceiptService _receiptService, IVehicleService _vehicleService, IReservationRepository _reservationRepository,ICustomerService _customerService, IMapper mapper) : IPaymentService
    {

        public async Task<bool> DeletePaymentAsync(int id)
        {
            var payment = await paymentRepository.GetPaymentByIdAsync(id);
            if (payment == null)
                return false;

            // ✅ Reset reservation status to Pending
            var reservation = await _reservationRepository.GetReservationById(payment.ReservationId);
            if (reservation != null)
            {
                reservation.Status = ReservationStatus.Pending;
                await _reservationRepository.UpdateReservation(reservation);
            }

            return await paymentRepository.DeletePaymentAsync(id);
        }
        public async Task RefundReservationAsync(int reservationId)
        {
            Console.WriteLine($"[Refund] Starting refund for Reservation {reservationId}…");

            // 1) Fetch the payment record by reservationId via IPaymentRepository
            var payment = await paymentRepository.GetByReservationIdAsync(reservationId);
            if (payment == null || string.IsNullOrEmpty(payment.StripePaymentIntentId))
            {
                Console.WriteLine($"[Refund] No payment found or missing IntentId for Reservation {reservationId}");
                throw new Exception($"No payment found to refund for reservation {reservationId}.");
            }

            // 2) Issue the refund through Stripe.NET
            try
            {
                var refundOptions = new RefundCreateOptions
                {
                    PaymentIntent = payment.StripePaymentIntentId
                };
                var refundService = new Stripe.RefundService();
                var stripeRefund = await refundService.CreateAsync(refundOptions);

                Console.WriteLine($"[Refund] Stripe refund created: {stripeRefund.Id}");

                // 3) Update the local payment record as refunded
                payment.IsRefunded = true;
                payment.RefundedAt = DateTime.UtcNow;
                payment.StripeRefundId = stripeRefund.Id;
                await paymentRepository.UpdateAsync(payment);

                Console.WriteLine($"[Refund] Local payment record updated for Reservation {reservationId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Refund] Exception during refund for Reservation {reservationId}: {ex.Message}");
                throw;
            }

            Console.WriteLine($"[Refund] Completed refund for Reservation {reservationId}");
        }


        public async Task<PaymentDto?> GetPaymentByReservationIdAsync(int reservationId)
        {
            var payment = await paymentRepository.GetFirstPaymentByReservationIdAsync(reservationId);

            return payment != null ? mapper.Map<PaymentDto>(payment) : null;
        }
        public async Task<IEnumerable<PaymentDto>> GetPaymentsByCustomerIdAsync(int customerId)
        {
            var allPayments = await paymentRepository.GetAllPaymentsAsync();

            var paymentsForCustomer = allPayments
                .Where(p => p.Reservation != null && p.Reservation.CustomerId == customerId)
                .ToList();

            return mapper.Map<IEnumerable<PaymentDto>>(paymentsForCustomer);
        }

        public async Task<PaymentDto> CreateFinalPaymentForReservationAsync(int reservationId)
        {
            var reservation = await _reservationRepository.GetReservationById(reservationId)
                              ?? throw new ArgumentException("Reservation not found.");

            var tripDetailsList = await tripDetailsRepository.GetTripDetailsByVehicleId(reservation.VehicleId);
            var latestTrip = tripDetailsList.OrderByDescending(t => t.TripDetailsId).FirstOrDefault();
            if (latestTrip == null)
                throw new InvalidOperationException("Trip details not found for this vehicle.");

            var totalTripCost = latestTrip.TotalCost;
            Console.WriteLine($"🧾 Total trip cost: €{totalTripCost:F2}");

            // ✅ Fetch damage cost from MongoDB
            var postCondition = await vehiclePostConditionRepository.GetVehiclePostConditionByVehicleId(reservation.VehicleId);
            double damageCost = postCondition?.TotalCost ?? 0;
            Console.WriteLine($"🔧 Damage cost: €{damageCost:F2}");

            // ✅ Fetch insurance
            var insurance = await iInsurancePolicyRepository.GetInsurancePolicyByCustomerId(reservation.CustomerId);
            double coveragePercent = insurance?.CoveragePercentage ?? 0;
            Console.WriteLine(insurance != null
                ? $"🛡 Insurance coverage: {coveragePercent}%"
                : "🛡 No insurance found. Customer pays full damage cost.");

            // ✅ Calculate liability
            double customerLiability = damageCost * (1 - coveragePercent / 100.0);
            Console.WriteLine($"💰 Customer liability for damage: €{customerLiability:F2}");

            // ✅ Final cost
            var finalTotalCost = totalTripCost + (decimal)customerLiability;
            Console.WriteLine($"💳 Final total cost to be paid: €{finalTotalCost:F2}");

            // ✅ Get prepayment
            var prepayment = await paymentRepository.GetFirstPaymentByReservationIdAsync(reservationId);
            if (prepayment == null)
                throw new InvalidOperationException("Prepayment not found for this reservation.");

            var amountInCents = (int)(finalTotalCost * 100);
            if (amountInCents < 50)
                throw new ArgumentException($"Total cost must convert to at least 50 cents. Got: €{finalTotalCost}");

            // Fetch the vehicle entity so we can get Mark/Model
            var vehicle = await _vehicleService.GetVehicleById(reservation.VehicleId);
            if (vehicle == null)
                throw new ArgumentException("Vehicle not found for this reservation.");

            // ✅ Create Stripe intent
            var stripeOptions = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "eur",
                Description = $"Final payment for {vehicle.Mark} {vehicle.Model}",
                Metadata = new Dictionary<string, string>
        {
            { "reservationId", reservation.ReservationId.ToString() },
            { "customerId", reservation.CustomerId.ToString() },
            { "prepaymentAmount", prepayment.PrepaymentAmount.ToString("F2") },
            { "damageCost", customerLiability.ToString("F2") }
        },
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                    AllowRedirects = "never"
                }
            };

            var stripeService = new PaymentIntentService();
            var intent = await stripeService.CreateAsync(stripeOptions);

            var payment = new Payment
            {
                ReservationId = reservation.ReservationId,
                PrepaymentAmount = prepayment.PrepaymentAmount,
                TotalPrice = finalTotalCost,
                Description = $"Final payment for {vehicle.Mark} {vehicle.Model}",
                PaymentStatus = "pending",
                StripeStatus = "pending",
                StripePaymentIntentId = intent.Id,
                StripeClientSecret = intent.ClientSecret,
                DateIssued = null
            };

            var success = await paymentRepository.InsertPaymentAsync(payment);
            if (!success)
                throw new Exception("Failed to insert final Stripe payment.");

            Console.WriteLine("✅ Final payment created successfully.");
            return mapper.Map<PaymentDto>(payment);
        }

        public async Task<PaymentDto> CreatePaymentIntentAsync(CreatePaymentIntentRequestDto dto)
        {
            var reservation = await paymentRepository.GetReservationWithCustomerAsync(dto.ReservationId);
            if (reservation == null)
                throw new ArgumentException("Reservation not found.");

            // Fetch vehicle and its prepay fee from reservation
            var vehicle = reservation.Vehicle;
            if (vehicle == null)
                throw new ArgumentException("Vehicle not found for the reservation.");

            // Get prepay fee from vehicle entity
            var amount = vehicle.PrepayFee;
            if (amount <= 0)
                throw new ArgumentException("Prepay fee must be greater than 0.");

            // Convert to cents
            var amountInCents = (int)(amount * 100);

            if (amountInCents < 50)
                throw new ArgumentException($"Amount must convert to at least 50 cents. You entered €{dto.Amount}.");

            var existingPayment = await paymentRepository.GetPendingPaymentByReservationIdAsync(dto.ReservationId);
            if (existingPayment != null)
                throw new ArgumentException("A pending payment already exists for this reservation.");

            var stripeOptions = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "eur",
                Description = dto.Description,
                Metadata = new Dictionary<string, string>
                {
                    { "reservationId", dto.ReservationId.ToString() },
                    { "customerId", reservation.CustomerId.ToString() }
                },
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                    AllowRedirects = "never"
                }
            };
            var stripeService = new PaymentIntentService();
            var intent = await stripeService.CreateAsync(stripeOptions);

            var payment = new Payment
            {
                ReservationId = dto.ReservationId,
                PrepaymentAmount = amount,                // ✅ use fetched amount
                Description = dto.Description,
                PaymentStatus = "pending",
                StripePaymentIntentId = intent.Id,
                StripeClientSecret = intent.ClientSecret,
                StripeStatus = "pending",
                DateIssued = null
            };

            var success = await paymentRepository.InsertPaymentAsync(payment);
            if (!success)
                throw new Exception("Failed to save payment to the database.");

            return mapper.Map<PaymentDto>(payment);
        }

        public async Task<bool> ConfirmPaymentByIdAsync(ConfirmPaymentByIdRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.PaymentMethodId))
                throw new ArgumentException("Payment method is required.");

            var payment = await paymentRepository.GetPaymentByIdAsync(dto.PaymentId);
            if (payment == null)
                throw new ArgumentException("Payment not found.");

            // Local function to finalize a prepayment
            var updatePaymentStatus = async () =>
            {
                payment.PaymentStatus = "pre-paid";
                payment.StripeStatus = "succeeded";
                payment.DateIssued = DateTime.UtcNow;

                var updated = await paymentRepository.UpdatePaymentAsync(payment.PaymentId, payment);
                if (!updated)
                    throw new Exception("Failed to update payment status.");

                var reservation = await _reservationRepository.GetReservationById(payment.ReservationId);
                if (reservation == null)
                    throw new ArgumentException("Reservation not found.");

                reservation.Status = ReservationStatus.Reserved;
                reservation.UpdatedAt = DateTime.UtcNow;
                await _reservationRepository.UpdateReservation(reservation);

                var user = await _customerService.GetCustomerById(reservation.CustomerId);
                if (user == null)
                    throw new ArgumentException("Customer not found.");

                var vehicle = await _vehicleService.GetVehicleById(reservation.VehicleId);
                if (vehicle == null)
                    throw new ArgumentException("Vehicle not found.");

                // Build Receipt entity
                var receipt = new Receipt(
                    receiptId: 0,
                    paymentId: payment.PaymentId,
                    receiptType: dto.PaymentMethodId == "cash" ? "Cash" : "Card",
                    amount: payment.PrepaymentAmount,
                    issuedAt: DateTime.UtcNow,
                    receiptData: new byte[0]
                )
                { Payment = payment };

                var customerEntity = await _customerRepository.GetCustomerById(reservation.CustomerId);
                var vehicleEntity = await _vehicleRepository.GetVehicleById(reservation.VehicleId);

                // Generate prepayment PDF
                // (no damage/trip info needed)
                var receiptData = PrePaymentReceiptPdfGenerator.Generate(
                    receipt,
                    customerEntity,
                    vehicleEntity,
                    reservation.StartDate,
                    reservation.EndDate,
                    costPerDay: null // or pass if you want cost-per-day
                );

                receipt.ReceiptData = receiptData;

                _ = Task.Run(async () =>
                {
                    var emailService = new EmailTemplate();
                    await emailService.SendPrePaymentConfirmationEmail(
                        user.Email,
                        user.Username,
                        reservation.ReservationId,
                        vehicle.Mark,
                        vehicle.Model,
                        receiptData
                    );
                });

                var receiptDto = new ReceiptDto(
                    0,
                    payment.PaymentId,
                    receipt.ReceiptType,
                    receipt.Amount,
                    receipt.IssuedAt,
                    receiptData
                );

                var inserted = await _receiptService.InsertReceipt(receiptDto);
                if (!inserted)
                    throw new Exception("Failed to insert receipt.");

                // Optional: delete payment after a delay
                _ = Task.Run(async () =>
                {
                    await Task.Delay(10000);
                    await paymentRepository.DeletePaymentAsync(payment.PaymentId);
                });

                return true;
            };

            if (dto.PaymentMethodId == "cash")
                return await updatePaymentStatus();

            var stripe = new PaymentIntentService();
            await stripe.UpdateAsync(payment.StripePaymentIntentId, new PaymentIntentUpdateOptions
            {
                PaymentMethod = dto.PaymentMethodId
            });

            var confirmed = await stripe.ConfirmAsync(payment.StripePaymentIntentId);
            return confirmed.Status == "succeeded"
                ? await updatePaymentStatus()
                : throw new Exception($"❌ Payment not completed. Stripe status: {confirmed.Status}");
        }

        public async Task<bool> ConfirmFinalPaymentByIdAsync(ConfirmPaymentByIdRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.PaymentMethodId))
                throw new ArgumentException("Payment method is required.");

            var payment = await paymentRepository.GetPaymentByIdAsync(dto.PaymentId)
                          ?? throw new ArgumentException("Payment not found.");

            if (payment.TotalPrice == null || payment.TotalPrice <= 0)
                throw new ArgumentException("Total price is invalid for final payment.");

            var updateFinalPaymentStatus = async () =>
            {
                payment.PaymentStatus = "paid";
                payment.StripeStatus = "succeeded";
                payment.DateIssued = DateTime.UtcNow;

                var updated = await paymentRepository.UpdatePaymentAsync(payment.PaymentId, payment);
                if (!updated)
                    throw new Exception("Failed to update final payment status.");

                var reservation = await _reservationRepository.GetReservationById(payment.ReservationId)
                                  ?? throw new ArgumentException("Reservation not found.");

                reservation.UpdatedAt = DateTime.UtcNow;
                await _reservationRepository.UpdateReservation(reservation);

                var user = await _customerService.GetCustomerById(reservation.CustomerId)
                           ?? throw new ArgumentException("Customer not found.");

                var vehicle = await _vehicleService.GetVehicleById(reservation.VehicleId)
                              ?? throw new ArgumentException("Vehicle not found.");

                var customerEntity = await _customerRepository.GetCustomerById(reservation.CustomerId);
                var vehicleEntity = await _vehicleRepository.GetVehicleById(reservation.VehicleId);

                // Fetch pre-condition (MongoDB) to compute existing damage
                var preCondition = await vehiclePreConditionRepository
                    .GetVehiclePreConditionByVehicleId(reservation.VehicleId)
                    ?? throw new Exception("Pre-condition not found.");

                double existingScratchCost = preCondition.HasScratches
                    ? (string.IsNullOrWhiteSpace(preCondition.ScratchDescription) ? 0 : 50)
                    : 0;
                double existingDentCost = preCondition.HasDents
                    ? (string.IsNullOrWhiteSpace(preCondition.DentDescription) ? 0 : 75)
                    : 0;
                double existingRustCost = preCondition.HasRust
                    ? (string.IsNullOrWhiteSpace(preCondition.RustDescription) ? 0 : 100)
                    : 0;

                // Fetch post-condition (MongoDB) to compute new damage
                var postCondition = await vehiclePostConditionRepository
                    .GetVehiclePostConditionByVehicleId(reservation.VehicleId);

                double newScratchCost = 0, newDentCost = 0, newRustCost = 0;
                if (postCondition != null)
                {
                    // Compare against preCondition to find new damage
                    if (!preCondition.HasScratches && postCondition.HasScratches)
                        newScratchCost = 100;
                    else if (preCondition.HasScratches && postCondition.HasScratches
                             && !string.Equals(
                                 preCondition.ScratchDescription?.Trim(),
                                 postCondition.ScratchDescription?.Trim(),
                                 StringComparison.OrdinalIgnoreCase))
                        newScratchCost = 50;

                    if (!preCondition.HasDents && postCondition.HasDents)
                        newDentCost = 150;
                    else if (preCondition.HasDents && postCondition.HasDents
                             && !string.Equals(
                                 preCondition.DentDescription?.Trim(),
                                 postCondition.DentDescription?.Trim(),
                                 StringComparison.OrdinalIgnoreCase))
                        newDentCost = 75;

                    if (!preCondition.HasRust && postCondition.HasRust)
                        newRustCost = 200;
                    else if (preCondition.HasRust && postCondition.HasRust
                             && !string.Equals(
                                 preCondition.RustDescription?.Trim(),
                                 postCondition.RustDescription?.Trim(),
                                 StringComparison.OrdinalIgnoreCase))
                        newRustCost = 100;
                }

                // Fetch insurance policy (SQL)
                var insurance = await iInsurancePolicyRepository
                    .GetInsurancePolicyByCustomerId(reservation.CustomerId);
                double insuranceCoveragePct = insurance?.CoveragePercentage ?? 0;

                // Fetch trip details
                var tripDetailsList = await tripDetailsRepository
                    .GetTripDetailsByVehicleId(reservation.VehicleId);
                var latestTrip = tripDetailsList
                    .OrderByDescending(t => t.TripDetailsId)
                    .FirstOrDefault();
                decimal totalTripCost = latestTrip?.TotalCost ?? 0m;

                var reservationStartDate = reservation.StartDate;
                var reservationEndDate = reservation.BroughtBack ? DateTime.UtcNow.Date : reservation.EndDate;

                decimal costPerDay = 0m;
                try
                {
                    costPerDay = priceService.CalculateDailyPayment(
                        vehicle.Category, vehicle.Mark, vehicle.Year);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Failed to calculate cost per day: {ex.Message}");
                }

                // Build Receipt entity
                var receipt = new Receipt(
                    receiptId: 0,
                    paymentId: payment.PaymentId,
                    receiptType: dto.PaymentMethodId == "cash" ? "Cash" : "Card",
                    amount: payment.TotalPrice.Value,
                    issuedAt: DateTime.UtcNow,
                    receiptData: new byte[0]
                )
                { Payment = payment };

                // Generate final payment PDF with 14 arguments
                var receiptData = FinalPaymentReceiptPdfGenerator.Generate(
                    receipt,                           // 1. Receipt
                    customerEntity,                    // 2. Customer
                    vehicleEntity,                     // 3. Vehicle

                    existingScratchCost,               // 4. double existingScratchCost
                    preCondition.ScratchDescription ?? "", // 5. string existingScratchDescription

                    existingDentCost,                  // 6. double existingDentCost
                    preCondition.DentDescription ?? "",    // 7. string existingDentDescription

                    existingRustCost,                  // 8. double existingRustCost
                    preCondition.RustDescription ?? "",    // 9. string existingRustDescription

                    newScratchCost,                    // 10. double newScratchCost
                    postCondition?.ScratchDescription ?? "", // 11. string newScratchDescription

                    newDentCost,                       // 12. double newDentCost
                    postCondition?.DentDescription ?? "",    // 13. string newDentDescription

                    newRustCost,                       // 14. double newRustCost
                    postCondition?.RustDescription ?? "",    // 15. string newRustDescription

                    insuranceCoveragePct,              // 16. double insuranceCoveragePct
                    totalTripCost,                     // 17. decimal totalTripCost
                    reservationStartDate,              // 18. DateTime reservationStartDate
                    reservationEndDate,                // 19. DateTime reservationEndDate
                    costPerDay                         // 20. decimal costPerDay
                );
                receipt.ReceiptData = receiptData;

                _ = Task.Run(async () =>
                {
                    var emailService = new EmailTemplate();
                    await emailService.SendFinalPaymentEmail(
                        toEmail: user.Email,
                        username: user.Username,
                        reservationId: reservation.ReservationId,
                        vehicleBrand: vehicle.Mark,
                        vehicleModel: vehicle.Model,
                        totalPrice: payment.TotalPrice.Value,
                        pdfData: receiptData,
                        damageCost: existingScratchCost + existingDentCost + existingRustCost + newScratchCost + newDentCost + newRustCost,
                        insuranceCoverage: insuranceCoveragePct,
                        scratchDesc: postCondition?.ScratchDescription,
                        dentDesc: postCondition?.DentDescription,
                        rustDesc: postCondition?.RustDescription,
                        totalTripCost: totalTripCost
                    );
                });

                var receiptDto = new ReceiptDto(
                    0,
                    payment.PaymentId,
                    receipt.ReceiptType,
                    receipt.Amount,
                    receipt.IssuedAt,
                    receiptData
                );

                var inserted = await _receiptService.InsertReceipt(receiptDto);
                if (!inserted)
                    throw new Exception("Failed to insert final receipt.");

                Console.WriteLine($"💰 Final Payment confirmed: €{payment.TotalPrice.Value} for Reservation #{reservation.ReservationId}");
                return true;
            };

            if (dto.PaymentMethodId == "cash")
                return await updateFinalPaymentStatus();

            var stripe = new PaymentIntentService();
            await stripe.UpdateAsync(payment.StripePaymentIntentId, new PaymentIntentUpdateOptions
            {
                PaymentMethod = dto.PaymentMethodId
            });

            var confirmed = await stripe.ConfirmAsync(payment.StripePaymentIntentId);
            return confirmed.Status == "succeeded"
                ? await updateFinalPaymentStatus()
                : throw new Exception($"❌ Final payment not completed. Stripe status: {confirmed.Status}");
        }

        public async Task<string?> GetCustomerUsernameByPaymentIdAsync(int paymentId)
        {
            var payment = await paymentRepository.GetPaymentByIdAsync(paymentId);
            if (payment == null)
                throw new ArgumentException("Payment not found.");

            var reservation = await _reservationRepository.GetReservationById(payment.ReservationId);
            if (reservation == null)
                throw new ArgumentException("Reservation not found for the payment.");

            var customer = await _customerService.GetCustomerById(reservation.CustomerId);
            if (customer == null)
                throw new ArgumentException("Customer not found for the reservation.");

            return customer.Username;
        }

        public async Task<PaymentDto> GetPaymentAsync(int id)
        {
            var payment = await paymentRepository.GetPaymentByIdAsync(id);

            var paymentDto = mapper.Map<PaymentDto>(payment);

            return paymentDto;
        }

        public async Task<bool> InsertPayment(PaymentDto paymentDto)
        {
            if (paymentDto is null)
                return false;

            var payment = mapper.Map<Payment>(paymentDto);

            var success = await paymentRepository.InsertPaymentAsync(payment);

            return success;
        }

        public async Task<bool> UpdatePaymentAsync(int id, PaymentDto paymentDto)
        {
            var payment = mapper.Map<Payment>(paymentDto);

            return await paymentRepository.UpdatePaymentAsync(id, payment);
        }

        public async Task<IEnumerable<PaymentDto>> GetAllPaymentsAsync()
        {
            var payments = await paymentRepository.GetAllPaymentsAsync();
            return mapper.Map<IEnumerable<PaymentDto>>(payments);
        }
    }
}
