using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;
using System;

namespace VRMS.UI.Controllers
{
    [Route("api/trucks")]
    [ApiController]
    public class TruckController : ControllerBase
    {
        private readonly ITruckService _truckService;
        private readonly IVehicleService _vehicleService;

        public TruckController(
            ITruckService truckService,
            IVehicleService vehicleService)
        {
            _truckService = truckService;
            _vehicleService = vehicleService;
        }

        /*──────────────────────────────*
         *  READ – ALL / BY ID          *
         *──────────────────────────────*/

        // GET: /api/trucks/trucks
        [HttpGet("trucks")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllTrucks()
        {
            var trucks = await _truckService.GetAllTrucks();
            return Ok(trucks);
        }

        // GET: /api/trucks/truck/{id}
        [HttpGet("truck/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetTruck(int id)
        {
            var truck = await _truckService.GetTruckById(id);
            if (truck == null)
                return NotFound(new { message = "Truck not found." });

            return Ok(truck);
        }

        /*──────────────────────────────*
         *  CREATE                      *
         *──────────────────────────────*/

        // POST: /api/trucks/create-truck
        [HttpPost("create-truck")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateTruck([FromBody] TruckDto truckDto)
        {
            try
            {
                var createdTruck = await _truckService.CreateTruck(truckDto);
                return Ok(createdTruck);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /*──────────────────────────────*
         *  UPDATE                      *
         *──────────────────────────────*/

        // PUT: /api/trucks/update-truck/{id}
        [HttpPut("update-truck/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateTruck(int id, [FromBody] TruckDto truckDto)
        {
            if (id != truckDto.VehicleId)
                return BadRequest(new { message = "Truck ID mismatch." });

            try
            {
                var updatedTruck = await _truckService.UpdateTruck(truckDto);
                return Ok(updatedTruck);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /*──────────────────────────────*
         *  DELETE                      *
         *──────────────────────────────*/

        // DELETE: /api/trucks/delete-truck/{id}
        [HttpDelete("delete-truck/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteTruck(int id)
        {
            var truck = await _truckService.GetTruckById(id);
            if (truck == null)
                return NotFound(new { message = "Truck not found." });

            await _vehicleService.DeleteVehicle(id);
            return Ok(new { message = "Truck deleted successfully!" });
        }

        /*──────────────────────────────*
         *  MODELS BY MARK              *
         *──────────────────────────────*/

        // GET: /api/trucks/models/{mark}
        [HttpGet("models/{mark}")]
        public IActionResult GetModelsByMark(string mark)
        {
            var models = _truckService.GetModelsByMark(mark);
            return Ok(models);
        }
    }
}
