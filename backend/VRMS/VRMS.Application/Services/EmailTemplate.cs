using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using DotNetEnv;
using System.IO;

namespace VRMS.Application.Services
{
    public class EmailTemplate
    {
        private readonly string _emailUser;
        private readonly string _emailPass;

        public EmailTemplate()
        {
            string currentDir = Directory.GetCurrentDirectory();
            string envFilePath = Path.Combine(currentDir, "..", ".env");

            if (File.Exists(envFilePath))
            {
                Env.Load(envFilePath);
                Console.WriteLine($"✅ EmailTemplate loaded .env from: {envFilePath}");
            }

            _emailUser = Environment.GetEnvironmentVariable("GMAIL_USER")
                         ?? throw new Exception("GMAIL_USER is missing");
            _emailPass = Environment.GetEnvironmentVariable("GMAIL_PASS")
                         ?? throw new Exception("GMAIL_PASS is missing");
        }

        private async Task SendEmail(string toEmail, string subject, string plainTextBody, string htmlBody, byte[]? pdfData = null)

        {
            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.EnableSsl = true;
                smtp.UseDefaultCredentials = false;
                smtp.Credentials = new NetworkCredential(_emailUser, _emailPass);

                var message = new MailMessage
                {
                    From = new MailAddress(_emailUser, "QuickRent Auto"),
                    Subject = subject,
                    IsBodyHtml = true
                };

                var plainView = AlternateView.CreateAlternateViewFromString(plainTextBody, null, "text/plain");
                var htmlView = AlternateView.CreateAlternateViewFromString(htmlBody, null, "text/html");

                message.AlternateViews.Add(plainView);
                message.AlternateViews.Add(htmlView);

                message.Headers.Add("X-Priority", "3");
                message.Headers.Add("X-Mailer", "QuickRentMailer");
                message.Headers.Add("X-Entity-Ref-ID", Guid.NewGuid().ToString());

                message.To.Add(toEmail);

                if (pdfData != null && pdfData.Length > 0)
                {
                    var attachment = new Attachment(new MemoryStream(pdfData), "receipt.pdf", "application/pdf");
                    message.Attachments.Add(attachment);
                }

                try
                {
                    await smtp.SendMailAsync(message);
                    Console.WriteLine($"✅ Email sent to: {toEmail}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("❌ Failed to send email: " + ex.Message);
                }
            }
        }

        public async Task SendWelcomeEmail(string toEmail, string username)
        {
            var subject = "Welcome to QuickRent";

            var plainTextBody = $"Hello {username},\n\nWelcome to QuickRent Auto – your one-stop solution for managing vehicle rentals.\n\nYou can now manage bookings, view bills, and more. If you did not sign up, you can ignore this message.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr><td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 10px;'>Welcome to <strong>QuickRent Auto</strong> – your one-stop solution for managing vehicle rentals with ease.</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>Your registration was successful! You can now reserve vehicles, manage bookings, view bills, and access all the features of our Vehicle Rent Management System.</td></tr>
          <tr><td style='background-color: #e6f7ff; padding: 15px; border-left: 4px solid #3182ce; font-weight: bold;'>Start exploring your dashboard now and take control of your rentals effortlessly.</td></tr>
          <tr><td style='font-size: 14px; color: #555; padding-top: 20px;'>If you did not sign up for this account, reset your password.</td></tr>
          <tr><td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendVerificationCodeEmail(string toEmail, string username, string code)
        {
            var subject = "Password Reset Verification Code";

            var plainTextBody = $"Hello {username},\n\nYour verification code is: {code}\n\nThis code will expire in 1 minute.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr><td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>Your verification code for resetting your password is:</td></tr>
          <tr><td style='font-size: 28px; font-weight: bold; text-align: center; padding: 20px 0; color: #3182ce;'>{code}</td></tr>
          <tr><td style='font-size: 14px; color: #555; padding-top: 20px;'>This code will expire in 1 minute. If you did not request a password reset, you can ignore this message.</td></tr>
          <tr><td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendPasswordChangedEmail(string toEmail, string username)
        {
            var subject = "Your Password Has Been Changed";

            var plainTextBody = $"Hello {username},\n\nThis is a confirmation that your password has been successfully changed. If you did not perform this action, please contact support immediately.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr><td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 10px;'>We're letting you know that your password was recently changed.</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>If you made this change, no further action is needed.</td></tr>
          <tr><td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #cc0000;'>If you did not change your password, please contact our support team immediately.</td></tr>
          <tr><td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendReservationConfirmationEmail(string toEmail, string username, int reservationId, string vehicleBrand, string vehicleModel)
        {
            var subject = "Reservation Confirmation";

            var plainTextBody = $@"
Hello {username},

Your reservation (ID: {reservationId}) for the vehicle {vehicleBrand} {vehicleModel} has been successfully created.

To secure your reservation, please complete the prepayment within the next 30 minutes. 
Failure to do so will result in automatic cancellation.

Thank you for choosing QuickRent Auto.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr>
            <td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Dear {username},</td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              We’re pleased to confirm your reservation for the vehicle <strong>{vehicleBrand} {vehicleModel}</strong>.
            </td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px; color: #cc0000;'>
              To keep your reservation, please complete the required prepayment within <strong>30 minutes</strong>. Otherwise, the reservation will be automatically cancelled.
            </td>
          </tr>
          <tr>
            <td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>
              &copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendReservationExpiredEmail(string toEmail, string username, string vehicleBrand, string vehicleModel)
        {
            var subject = "Reservation Cancelled Due to Expired Payment";

            var plainTextBody = $@"
Hello {username},

We regret to inform you that your reservation for the vehicle {vehicleBrand} {vehicleModel} has been automatically cancelled due to missing prepayment within the required time window.

If you still wish to reserve this vehicle, please initiate a new reservation through your QuickRent Auto dashboard.

Thank you for understanding.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr>
            <td style='font-size: 24px; color: #cc0000; padding-bottom: 20px;'>Reservation Cancelled</td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              Hello {username},<br/><br/>
              Your reservation for <strong>{vehicleBrand} {vehicleModel}</strong> has been automatically cancelled because the required prepayment was not received within the 30-minute time limit.
            </td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              If this was a mistake or you still wish to book a vehicle, please visit your dashboard to create a new reservation.
            </td>
          </tr>
          <tr>
            <td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendPrePaymentConfirmationEmail(string toEmail, string username, int reservationId, string vehicleBrand, string vehicleModel, byte[]? pdfData = null)
        {
            var subject = "Pre-Payment Confirmation";
            var plainTextBody = $@"
Hello {username},

Your pre-payment has been successfully processed.

Please find the official receipt attached as a PDF.

Thank you for choosing QuickRent Auto.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr>
            <td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              Your pre-payment has been successfully processed. <br/>
              Please find your official receipt attached as a PDF document.
            </td>
          </tr>
          <tr>
            <td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
            await SendEmail(toEmail, subject, plainTextBody, htmlBody, pdfData); // ✅ pass the PDF

        }// u kry

        public async Task SendFinalPaymentEmail(string toEmail, string username, int reservationId, string vehicleBrand, string vehicleModel, decimal totalPrice, byte[]? pdfData = null, double? damageCost = null, double? insuranceCoverage = null, string? scratchDesc = null, string? dentDesc = null, string? rustDesc = null, decimal? totalTripCost = null)
        {
            var subject = "Final Payment Confirmation";

            var plainTextBody = $@"
Hello {username},

Your final payment of €{totalPrice:F2} for Reservation #{reservationId} has been successfully processed.

Please find the final receipt attached as a PDF.

Thank you for choosing QuickRent Auto.";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr>
            <td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              Your final payment of <strong>€{totalPrice:F2}</strong> for Reserving <strong>#{vehicleBrand}{vehicleModel}</strong> has been successfully processed.
              <br/><br/>
              Please find your final receipt attached as a PDF document.
            </td>
          </tr>";
            htmlBody += $@"
          <tr>
            <td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody, pdfData);
        }

        public async Task SendVehicleReassignmentEmail(string toEmail, string username, int reservationId, string oldVehicle, string newVehicle)
        {
            var subject = "Vehicle Reassigned for Your Reservation";

            var plainTextBody = $@"
Hello {username},

We wanted to let you know that your reserved vehicle {oldVehicle} for Reservation #{reservationId} was unavailable due to a late return.

To avoid disruption, we've reassigned your reservation to a similar vehicle: {newVehicle}.

Thank you for your understanding.
";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding: 20px; background-color: #f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color: #ffffff; padding: 30px; border: 1px solid #ddd;'>
          <tr>
            <td style='font-size: 24px; color: #2b6cb0; padding-bottom: 20px;'>Hello {username},</td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              We wanted to inform you that your originally reserved vehicle <strong>{oldVehicle}</strong> for Reservation <strong>#{reservationId}</strong> was not available due to a delay in return.
            </td>
          </tr>
          <tr>
            <td style='font-size: 16px; line-height: 1.5; padding-bottom: 20px;'>
              To ensure a smooth experience, we have reassigned your reservation to a similar vehicle: <strong>{newVehicle}</strong>.
            </td>
          </tr>
          <tr>
            <td style='padding-top: 30px; font-size: 12px; color: #999; text-align: center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }// u kry

        public async Task SendRefundNotificationEmail(string toEmail, string username, int reservationId)
        {
            var subject = "Your Reservation Has Been Cancelled—Refund Issued";

            var plainTextBody = $@"
Hello {username},

We couldn’t find an available replacement vehicle for your reservation #{reservationId}, so it has been cancelled.
A full refund has been issued to your original payment method. You should see the reversal in 3–5 business days.

We’re sorry for any inconvenience.

QuickRent Auto Team
";

            var htmlBody = $@"
<html>
<body style='margin:0; padding:0; font-family:Segoe UI, sans-serif; background-color:#f9f9f9; color:#333;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='padding:20px; background-color:#f9f9f9;'>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='background-color:#ffffff; padding:30px; border:1px solid #ddd;'>
          <tr>
            <td style='font-size:24px; color:#cc0000; padding-bottom:20px;'>Reservation Cancelled</td>
          </tr>
          <tr>
            <td style='font-size:16px; line-height:1.5; padding-bottom:20px;'>
              Hello <strong>{username}</strong>,<br/><br/>
              We weren’t able to secure a replacement vehicle for your reservation <strong>#{reservationId}</strong>, 
              so it has been cancelled. A full refund has been issued to your original payment method. 
            </td>
          </tr>
          <tr>
            <td style='font-size:16px; line-height:1.5; padding-bottom:20px;'>
              We’re sorry for any inconvenience. If you’d like to book again, please visit your dashboard.
            </td>
          </tr>
          <tr>
            <td style='padding-top:30px; font-size:12px; color:#999; text-align:center;'>&copy; {DateTime.Now.Year} QuickRent Auto – Vehicle Rent Management System</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";

            await SendEmail(toEmail, subject, plainTextBody, htmlBody);
        }

    }
}
