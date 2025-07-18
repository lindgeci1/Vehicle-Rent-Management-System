using Microsoft.AspNetCore.Mvc;
using VRMS.Application.Dtos;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/vehicle-histories")]
    [ApiController]
    public class VehicleHistoryController : ControllerBase
    {
        private readonly IVehicleHistoryService _vehicleHistoryService;

        public VehicleHistoryController(IVehicleHistoryService vehicleHistoryService)
        {
            _vehicleHistoryService = vehicleHistoryService;
        }

        // GET: /api/vehicle-histories/histories
        [HttpGet("histories")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllHistories()
        {
            var histories = await _vehicleHistoryService.GetAllVehicleHistories();
            return Ok(histories);
        }

        // GET: /api/vehicle-histories/history/{id}
        [HttpGet("history/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetHistoryById(Guid id)
        {
            var history = await _vehicleHistoryService.GetVehicleHistoryById(id);
            if (history == null)
            {
                return NotFound(new { message = "Vehicle history not found." });
            }

            return Ok(history);
        }

        // POST: /api/vehicle-histories/create-history
        [HttpPost("create-history")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> CreateHistory([FromBody] VehicleHistoryDto vehicleHistoryDto)
        {
            try
            {
                var created = await _vehicleHistoryService.CreateVehicleHistory(vehicleHistoryDto); // ⬅️ get created object
                return Ok(created); // ⬅️ return full object
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

        // PUT: /api/vehicle-histories/update-history/{id}
        [HttpPut("update-history/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateHistory(Guid id, [FromBody] VehicleHistoryDto vehicleHistoryDto)
        {
            if (id != vehicleHistoryDto.Id)
            {
                return BadRequest(new { message = "VehicleHistory ID mismatch." });
            }

            try
            {
                var updated = await _vehicleHistoryService.UpdateVehicleHistory(vehicleHistoryDto); // ⬅️ get updated object
                return Ok(updated); // ⬅️ return full object
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // DELETE: /api/vehicle-histories/delete-history/{id}
        [HttpDelete("delete-history/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DeleteHistory(Guid id)
        {
            try
            {
                await _vehicleHistoryService.DeleteVehicleHistory(id);
                return Ok(new { message = "Vehicle history deleted successfully!" });
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

        [HttpGet("vehicle/{vehicleId}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetHistoryByVehicleId(int vehicleId)
        {
            var history = await _vehicleHistoryService.GetVehicleHistoryByVehicleId(vehicleId);
            if (history == null)
                return NotFound();

            return Ok(history);
        }

    }
}
