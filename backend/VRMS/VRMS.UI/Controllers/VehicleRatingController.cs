using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Application.Middleware;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.UI.Controllers
{
    [Route("api/vehicle-ratings")]
    [ApiController]
    public class VehicleRatingController : ControllerBase
    {
        private readonly IVehicleRatingService _ratingService;

        public VehicleRatingController(IVehicleRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        // GET: /api/vehicle-ratings/ratings
        [HttpGet("ratings")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllRatings()
        {
            var result = await _ratingService.GetAllVehicleRatings();
            return Ok(result);
        }

        // GET: /api/vehicle-ratings/rating/{id}
        [HttpGet("rating/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetRatingById(Guid id)
        {
            var result = await _ratingService.GetVehicleRatingById(id);
            if (result == null)
                return NotFound(new { message = "Vehicle rating not found." });

            return Ok(result);
        }

        // GET: /api/vehicle-ratings/ratings-by-vehicle/{vehicleId}
        [HttpGet("ratings-by-vehicle/{vehicleId}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetRatingsByVehicleId(int vehicleId)
        {
            var result = await _ratingService.GetVehicleRatingsByVehicleId(vehicleId);
            if (result == null || result.Count == 0)
                return NotFound(new { message = "No ratings found for this vehicle." });

            return Ok(result);
        }
        [HttpGet("ratings-by-customer/{customerId}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetRatingsByCustomerId(int customerId)
        {
            var result = await _ratingService.GetVehicleRatingsByCustomerId(customerId);
            if (result == null || result.Count == 0)
                return NotFound(new { message = "No ratings found for this vehicle." });

            return Ok(result);
        }

        // POST: /api/vehicle-ratings/create-rating
        [HttpPost("create-rating")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateRating([FromBody] VehicleRatingDto dto)
        {
            try
            {
                var created = await _ratingService.CreateVehicleRating(dto);
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

        // PUT: /api/vehicle-ratings/update-rating/{id}
        [HttpPut("update-rating/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateRating(Guid id, [FromBody] VehicleRatingDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "VehicleRating ID mismatch." });

            try
            {
                var updated = await _ratingService.UpdateVehicleRating(dto);
                return Ok(updated);
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

        // DELETE: /api/vehicle-ratings/delete-rating/{id}
        [HttpDelete("delete-rating/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteRating(Guid id)
        {
            try
            {
                await _ratingService.DeleteVehicleRating(id);
                return Ok(new { message = "Vehicle rating deleted successfully!" });
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

        [HttpGet("ratings/user/{userId}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetRatingsByUserId(int userId)
        {
            var result = await _ratingService.GetVehicleRatingsByCustomerId(userId);
            return Ok(result ?? new List<VehicleRatingDto>()); // ✅ Always return 200 with empty list
        }


    }
}
