using Microsoft.AspNetCore.Mvc;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController(IPaymentService paymentService) : ControllerBase
    {
        [HttpPost("Insert")]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentDto paymentDto)
        {
            var success = await paymentService.InsertPayment(paymentDto);

            if (!success)
                return BadRequest();

            return Ok();
        }
        [HttpPost("create-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequestDto dto)
        {
            try
            {
                var result = await paymentService.CreatePaymentIntentAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("confirm-final-payment-by-id")]
        public async Task<IActionResult> ConfirmFinalPaymentById([FromBody] ConfirmPaymentByIdRequestDto dto)
        {
            try
            {
                var result = await paymentService.ConfirmFinalPaymentByIdAsync(dto);
                return result
                    ? Ok(new { message = "✅ Final payment confirmed." })
                    : BadRequest(new { message = "❌ Failed to confirm final payment." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("confirm-payment-by-id")]
        public async Task<IActionResult> ConfirmPaymentById([FromBody] ConfirmPaymentByIdRequestDto dto)
        {
            try
            {
                var result = await paymentService.ConfirmPaymentByIdAsync(dto);
                return result ? Ok(new { message = "✅ Payment confirmed." }) :
                                BadRequest(new { message = "❌ Failed to confirm payment." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetPayment")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await paymentService.GetPaymentAsync(id);

            if (payment is null)
                return NotFound();

            return Ok(payment);
        }


        [HttpPut("UpdatePayment")]
        public async Task<IActionResult> UpdatePayment(int id, PaymentDto paymentDto)
        {
            var paymentSuccesful = await paymentService.UpdatePaymentAsync(id, paymentDto);

            if (!paymentSuccesful)
                return BadRequest();

            return Ok(paymentSuccesful);
        }

        [HttpDelete("DeletePayment")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var paymentSuccesful = await paymentService.DeletePaymentAsync(id);

            if (!paymentSuccesful)
                return BadRequest(new { message = "Failed to delete payment", success = paymentSuccesful });

            return Ok(new { message = "Payment deleted successfully", success = paymentSuccesful } );
        }

        [HttpGet("GetPayments")]
        public async Task<IActionResult> GetPayments()
        {
            var payments = await paymentService.GetAllPaymentsAsync();
            return Ok(payments);
        }

        [HttpGet("customer-username/{paymentId}")]
        public async Task<IActionResult> GetCustomerUsernameByPaymentId(int paymentId)
        {
            try
            {
                var username = await paymentService.GetCustomerUsernameByPaymentIdAsync(paymentId);
                if (username == null)
                    return NotFound(new { message = "Customer or related reservation not found." });

                return Ok(new { username });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{customerId}")]
        public async Task<IActionResult> GetPaymentsByCustomerId(int customerId)
        {
            try
            {
                var payments = await paymentService.GetPaymentsByCustomerIdAsync(customerId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}