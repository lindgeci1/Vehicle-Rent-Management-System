using Microsoft.AspNetCore.Mvc;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Application.Services;

namespace VRMS.UI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class ReceiptsController(IReceiptService receiptService) : ControllerBase
	{
		[HttpPost("Insert")]
		public async Task<IActionResult> CreateReceipt([FromBody] ReceiptDto receiptDto)
		{
			var success = await receiptService.InsertReceipt(receiptDto);

			if (!success)
				return BadRequest();

			return Ok();
		}

		[HttpGet("GetReceipt")]
		public async Task<IActionResult> GetReceipt(int id)
		{
			var receipt = await receiptService.GetReceiptAsync(id);

			if (receipt is null)
				return NotFound();

			return Ok(receipt);
		}

		[HttpGet("GetReceipts")]
		public async Task<IActionResult> GetAllReceipts()
		{
			var receipts = await receiptService.GetAllReceiptsAsync();
			return Ok(receipts);
		}

		[HttpPut("UpdateReceipt")]
		public async Task<IActionResult> UpdateReceipt(int id, [FromBody] ReceiptDto receiptDto)
		{
			var receiptSuccessful = await receiptService.UpdateReceiptAsync(id, receiptDto);

			if (!receiptSuccessful)
				return BadRequest();

			return Ok(receiptSuccessful);
		}

		[HttpDelete("DeleteReceipt")]
		public async Task<IActionResult> DeleteReceipt(int id)
		{
			var receiptSuccessful = await receiptService.DeleteReceiptAsync(id);

			if (!receiptSuccessful)
				return BadRequest(new { message = "Failed to delete receipt", success = receiptSuccessful });

			return Ok(new { message = "Receipt deleted successfully", success = receiptSuccessful });
		}
        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadReceipt(int id)
        {
            var receipt = await receiptService.GetReceiptAsync(id);
            if (receipt == null || receipt.ReceiptData == null)
                return NotFound("Receipt not available.");

            return File(receipt.ReceiptData, "application/pdf", $"receipt_{id}.pdf");
        }
        [HttpGet("customer-username/{receiptId}")]
        public async Task<IActionResult> GetCustomerUsernameByReceiptId(int receiptId)
        {
            try
            {
                var username = await receiptService.GetCustomerUsernameByReceiptIdAsync(receiptId);
                if (username == null)
                    return NotFound(new { message = "Customer or related data not found." });

                return Ok(new { username });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("user/{customerId}")]
        public async Task<IActionResult> GetReceiptsByCustomerId(int customerId)
        {
            try
            {
                var receipts = await receiptService.GetReceiptsByCustomerIdAsync(customerId);
                return Ok(receipts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
