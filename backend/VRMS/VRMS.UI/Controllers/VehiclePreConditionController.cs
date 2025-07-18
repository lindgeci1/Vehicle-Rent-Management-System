using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;
using VRMS.Application.Services;
using Stripe;

namespace VRMS.UI.Controllers
{
    [Route("api/vehicle-preconditions")]
    [ApiController]
    public class VehiclePreConditionController : ControllerBase
    {
        private readonly IVehiclePreConditionService _preConditionService;

        public VehiclePreConditionController(IVehiclePreConditionService preConditionService)
        {
            _preConditionService = preConditionService;
        }

        // GET: /api/vehicle-preconditions/preconditions
        [HttpGet("preconditions")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> GetAllPreConditions()
        {
            var result = await _preConditionService.GetAllVehiclePreConditions();
            return Ok(result);
        }

        // GET: /api/vehicle-preconditions/precondition/{id}
        [HttpGet("precondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> GetPreConditionById(Guid id)
        {
            var result = await _preConditionService.GetVehiclePreConditionById(id);
            if (result == null)
            {
                return NotFound(new { message = "Vehicle pre-condition not found." });
            }
            return Ok(result);
        }
        [HttpPost("create-precondition")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> CreatePreCondition(
            [FromBody] CreateVehiclePreConditionRequestDto request)
        {
            try
            {
                var created = await _preConditionService.CreateVehiclePreCondition(request);
                return Ok(created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }
        // PUT: /api/vehicle-preconditions/update-precondition/{id}
        [HttpPut("update-precondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> UpdatePreCondition(Guid id, [FromBody] VehiclePreConditionDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "VehiclePreCondition ID mismatch." });
            }

            try
            {
                var updated = await _preConditionService.UpdateVehiclePreCondition(dto);
                return Ok(updated); // ✅ return full updated object
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("{id:guid}/download")]
        [AuthorizeRoles("Admin", "Agent")] // or [AllowAnonymous] if you don’t require auth
        public async Task<IActionResult> DownloadPreConditionPdf(Guid id)
        {
            // 1) Fetch the DTO (which includes PreConditionPdf bytes)
            var dto = await _preConditionService.GetVehiclePreConditionById(id);
            if (dto == null)
            {
                return NotFound(new { message = $"No pre-condition found with ID {id}" });
            }

            if (dto.PreConditionPdf == null || dto.PreConditionPdf.Length == 0)
            {
                return NotFound(new { message = "No PDF data available for this pre-condition." });
            }

            // 2) Return a FileContentResult with content-type "application/pdf"
            //    The "File" helper automatically sets Content-Length, etc.
            string fileName = $"precondition_{id}.pdf";
            return File(dto.PreConditionPdf, "application/pdf", fileName);
        }

        [HttpGet("{id:guid}/customer-username")]
        public async Task<IActionResult> GetUsernameForPreCondition(Guid id)
        {
            try
            {
                var username = await _preConditionService.GetCustomerUsernameByPreConditionId(id);
                return Ok(new { username });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        // DELETE: /api/vehicle-preconditions/delete-precondition/{id}
        [HttpDelete("delete-precondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DeletePreCondition(Guid id)
        {
            try
            {
                await _preConditionService.DeleteVehiclePreCondition(id);
                return Ok(new { message = "Vehicle pre-condition deleted successfully!" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        [HttpGet("precondition-by-vehicle/{vehicleId}")]
        public async Task<IActionResult> GetPreConditionByVehicleId(int vehicleId)
        {
            var result = await _preConditionService.GetVehiclePreConditionByVehicleId(vehicleId);
            if (result == null)
                return NotFound("Pre-condition not found for this vehicle.");
            return Ok(result);
        }
    }
}
