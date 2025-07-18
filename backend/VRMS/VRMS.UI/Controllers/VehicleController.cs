using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/vehicles")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;
        private readonly IPhotoService _photoService;

        public VehicleController(
            IVehicleService vehicleService,
            IPhotoService photoService)
        {
            _vehicleService = vehicleService;
            _photoService = photoService;
        }

        // GET: /api/vehicles/vehicles
        [HttpGet("vehicles")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllVehicles()
        {
            var vehicles = await _vehicleService.GetAllVehicles();
            return Ok(vehicles);
        }

        // GET: /api/vehicles/vehicle/{id}
        [HttpGet("vehicle/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            var vehicle = await _vehicleService.GetVehicleById(id);

            if (vehicle == null)
            {
                return NotFound(new { message = "Vehicle not found." });
            }
            return Ok(vehicle);
        }

        // DELETE: /api/vehicles/delete-vehicle/{id}
        [HttpDelete("delete-vehicle/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DeleteVehicle(int id)
        {
            try
            {
                await _vehicleService.DeleteVehicle(id);
                return Ok(new { message = "Vehicle deleted successfully!" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("available")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAvailableVehiclesByDateAndCategory(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] string category,
            [FromQuery] int? seats = null,
            [FromQuery] string? fuelType = null,
            [FromQuery] int? year = null,
            [FromQuery] string? transmission = null) // ✅ correctly typed
        {
            if (startDate == default || endDate == default || endDate <= startDate)
                return BadRequest(new { message = "Invalid date range." });

            if (string.IsNullOrWhiteSpace(category))
                return BadRequest(new { message = "Category is required." });

            var vehicles = await _vehicleService.GetAvailableVehiclesByDateAndCategory(
                startDate, endDate, category, seats, fuelType, year, transmission);

            if (!vehicles.Any())
                return NotFound(new
                {
                    message = $"No available vehicles in '{category}' between {startDate:yyyy-MM-dd} and {endDate:yyyy-MM-dd}."
                });

            return Ok(vehicles);
        }



        [HttpPost("update-today-availability")]
        //[AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateTodayAvailability()
        {
            var logs = await _vehicleService.UpdateVehicleAvailabilityForToday();
            return Ok(logs); // return list of detailed logs
        }

        // POST: /api/vehicles/{id}/photos
        [HttpPost("{id}/photos")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UploadPhotos(
            int id,
            [FromForm] List<IFormFile> photos)
        {
            if (photos == null || !photos.Any())
                return BadRequest("Please attach at least one file under key ‘photos’.");

            var added = new List<PhotoDto>();
            foreach (var file in photos)
            {
                var publicId = $"vehicles/{id}/{Guid.NewGuid()}";
                var url = await _photoService.UploadAsync(
                                   file.OpenReadStream(),
                                   file.FileName,
                                   publicId);

                var dto = await _vehicleService.AddPhotoToVehicle(id, new PhotoDto
                {
                    Url = url,
                    PublicId = publicId
                });
                added.Add(dto);
            }

            return Ok(added);
        }


        [HttpDelete("photos/clear/{vehicleId}")]
        public async Task<IActionResult> ClearVehiclePhotos(int vehicleId)
        {
            try
            {
                await _vehicleService.ClearVehiclePhotos(vehicleId);
                return Ok(new { message = "Vehicle photos cleared." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("{vehicleId}/ratings")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetRatingsForVehicle(int vehicleId)
        {
            var ratings = await _vehicleService.GetRatingsForVehicle(vehicleId);
            if (ratings == null || !ratings.Any())
                return NotFound(new { message = "No ratings found for this vehicle." });

            return Ok(ratings);
        }
        [HttpGet("vehicle/{vehicleId}/daily-cost")]
        public async Task<ActionResult<decimal>> GetDailyRentalCost(int vehicleId)
        {
            try
            {
                var cost = await _vehicleService.GetDailyRentalCost(vehicleId);
                return Ok(cost);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while calculating daily cost.");
            }
        }

    }
}
