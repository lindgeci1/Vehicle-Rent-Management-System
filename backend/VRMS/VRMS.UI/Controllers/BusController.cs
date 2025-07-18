using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;
using System;
using VRMS.Application.Services;

namespace VRMS.UI.Controllers
{
    [Route("api/buses")]
    [ApiController]
    public class BusController : ControllerBase
    {
        private readonly IBusService _busService;
        private readonly IVehicleService _vehicleService;

        public BusController(
            IBusService busService,
            IVehicleService vehicleService)
        {
            _busService = busService;
            _vehicleService = vehicleService;
        }

        /*──────────────────────────────*
         *  READ – ALL / BY ID          *
         *──────────────────────────────*/

        // GET: /api/buses/buses
        [HttpGet("buses")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllBuses()
        {
            var buses = await _busService.GetAllBuses();
            return Ok(buses);
        }

        // GET: /api/buses/bus/{id}
        [HttpGet("bus/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetBus(int id)
        {
            var bus = await _busService.GetBusById(id);
            if (bus == null)
                return NotFound(new { message = "Bus not found." });

            return Ok(bus);
        }

        /*──────────────────────────────*
         *  CREATE                      *
         *──────────────────────────────*/

        // POST: /api/buses/create-bus
        [HttpPost("create-bus")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateBus([FromBody] BusDto busDto)
        {
            try
            {
                var createdBus = await _busService.CreateBus(busDto);
                return Ok(createdBus);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /*──────────────────────────────*
         *  UPDATE                      *
         *──────────────────────────────*/

        // PUT: /api/buses/update-bus/{id}
        [HttpPut("update-bus/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateBus(int id, [FromBody] BusDto busDto)
        {
            if (id != busDto.VehicleId)
                return BadRequest(new { message = "Bus ID mismatch." });

            try
            {
                var updatedBus = await _busService.UpdateBus(busDto);
                return Ok(updatedBus);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /*──────────────────────────────*
         *  DELETE                      *
         *──────────────────────────────*/

        // DELETE: /api/buses/delete-bus/{id}
        [HttpDelete("delete-bus/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteBus(int id)
        {
            var bus = await _busService.GetBusById(id);
            if (bus == null)
                return NotFound(new { message = "Bus not found." });

            await _vehicleService.DeleteVehicle(id);
            return Ok(new { message = "Bus deleted successfully!" });
        }

        /*──────────────────────────────*
         *  FILTER (example)            *
         *──────────────────────────────*/

        // GET: /api/motorcycles/models/{mark}
        [HttpGet("models/{mark}")]
        public IActionResult GetModelsByMark(string mark)
        {
            var models = _busService.GetModelsByMark(mark);
            return Ok(models);
        }
    }
}
