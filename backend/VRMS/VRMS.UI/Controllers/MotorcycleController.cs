using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/motorcycles")]
    [ApiController]
    public class MotorcycleController : ControllerBase
    {
        private readonly IMotorcycleService _motorcycleService;
        private readonly IVehicleService _vehicleService;

        public MotorcycleController(
            IMotorcycleService motorcycleService,
            IVehicleService vehicleService)
        {
            _motorcycleService = motorcycleService;
            _vehicleService = vehicleService;
        }

        // GET: /api/motorcycles/motorcycles
        [HttpGet("motorcycles")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllMotorcycles()
        {
            var motorcycles = await _motorcycleService.GetAllMotorcycles();
            return Ok(motorcycles);
        }

        // GET: /api/motorcycles/motorcycle/{id}
        [HttpGet("motorcycle/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetMotorcycle(int id)
        {
            var motorcycle = await _motorcycleService.GetMotorcycleById(id);

            if (motorcycle == null)
            {
                return NotFound(new { message = "Motorcycle not found." });
            }

            return Ok(motorcycle);
        }

        // POST: /api/motorcycles/create-motorcycle
        [HttpPost("create-motorcycle")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateMotorcycle([FromBody] MotorcycleDto motorcycleDto)
        {
            try
            {
                var createdMotorcycle = await _motorcycleService.CreateMotorcycle(motorcycleDto);
                return Ok(createdMotorcycle);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/motorcycles/update-motorcycle/{id}
        [HttpPut("update-motorcycle/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateMotorcycle(int id, [FromBody] MotorcycleDto motorcycleDto)
        {
            if (id != motorcycleDto.VehicleId)
            {
                return BadRequest(new { message = "Motorcycle ID mismatch." });
            }

            try
            {
                var updatedMotorcycle = await _motorcycleService.UpdateMotorcycle(motorcycleDto);
                return Ok(updatedMotorcycle);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: /api/motorcycles/delete-motorcycle/{id}
        [HttpDelete("delete-motorcycle/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteMotorcycle(int id)
        {
            var motorcycle = await _motorcycleService.GetMotorcycleById(id);

            if (motorcycle == null)
            {
                return NotFound(new { message = "Motorcycle not found." });
            }

            await _vehicleService.DeleteVehicle(id);
            return Ok(new { message = "Motorcycle deleted successfully!" });
        }

        // GET: /api/motorcycles/models/{mark}
        [HttpGet("models/{mark}")]
        public IActionResult GetModelsByMark(string mark)
        {
            var models = _motorcycleService.GetModelsByMark(mark);
            return Ok(models);
        }
    }
}
