using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/tripdetails")]
    [ApiController]
    public class TripDetailsController : ControllerBase
    {
        private readonly ITripDetailsService _tripDetailsService;

        public TripDetailsController(ITripDetailsService tripDetailsService)
        {
            _tripDetailsService = tripDetailsService;
        }

        // GET: /api/tripdetails/tripdetails
        [HttpGet("tripdetails")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllTripDetails()
        {
            var tripDetails = await _tripDetailsService.GetAllTripDetails();
            return Ok(tripDetails);
        }

        // GET: /api/tripdetails/tripdetail/{id}
        [HttpGet("tripdetail/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetTripDetails(int id)
        {
            var tripDetail = await _tripDetailsService.GetTripDetailsById(id);

            if (tripDetail == null)
            {
                return NotFound(new { message = "Trip details not found." });
            }
            return Ok(tripDetail);
        }

        // POST: /api/tripdetails/create-tripdetails
        [HttpPost("create-tripdetails")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> CreateTripDetails([FromBody] TripDetailsDto tripDetailsDto)
        {
            try
            {
                var created = await _tripDetailsService.CreateTripDetails(tripDetailsDto); // ✅ change return
                return Ok(created); // ✅ return the created TripDetailsDto
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/tripdetails/update-tripdetails/{id}
        [HttpPut("update-tripdetails/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> UpdateTripDetails(int id, [FromBody] TripDetailsDto tripDetailsDto)
        {
            if (id != tripDetailsDto.TripDetailsId) // Ensure the ID matches the one provided in the DTO
            {
                return BadRequest(new { message = "Trip details ID mismatch." });
            }

            try
            {
                var updated = await _tripDetailsService.UpdateTripDetails(tripDetailsDto); // ✅ change return
                return Ok(updated); // ✅ return the updated TripDetailsDto
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: /api/tripdetails/delete-tripdetails/{id}
        [HttpDelete("delete-tripdetails/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DeleteTripDetails(int id)
        {
            var tripDetail = await _tripDetailsService.GetTripDetailsById(id);

            // Check if the trip detail exists
            if (tripDetail == null)
            {
                return NotFound(new { message = "Trip details not found." });
            }

            // Proceed with deletion if the trip details exist
            await _tripDetailsService.DeleteTripDetails(id);
            return Ok(new { message = "Trip details deleted successfully!" });
        }
    }
}
