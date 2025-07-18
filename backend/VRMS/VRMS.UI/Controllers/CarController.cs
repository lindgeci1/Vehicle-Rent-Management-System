// These 'using' statements should be at the very top, before any namespace or class declaration.
using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/cars")]
    [ApiController]
    public class CarController : ControllerBase
    {
        private readonly ICarService _carService;
        private readonly IVehicleService _vehicleService;
        public CarController(
            ICarService carService,
            IVehicleService vehicleService)    // ← inject it
        {
            _carService = carService;
            _vehicleService = vehicleService;
        }

        // GET: /api/cars/cars
        [HttpGet("cars")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllCars()
        {
            var cars = await _carService.GetAllCars();
            return Ok(cars);
        }

        // GET: /api/cars/car/{id}
        [HttpGet("car/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetCar(int id)
        {
            var car = await _carService.GetCarById(id);

            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }
            return Ok(car);
        }

        // POST: /api/cars/create-car
        [HttpPost("create-car")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateCar([FromBody] CarDto carDto)
        {
            try
            {
                var createdCar = await _carService.CreateCar(carDto); // 🧠 return the object
                return Ok(createdCar); // ✅ send it to frontend
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/cars/update-car/{id}
        [HttpPut("update-car/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateCar(int id, [FromBody] CarDto carDto)
        {
            if (id != carDto.VehicleId)
            {
                return BadRequest(new { message = "Car ID mismatch." });
            }

            try
            {
                var updatedCar = await _carService.UpdateCar(carDto); // 🧠 return the object
                return Ok(updatedCar); // ✅ send it to frontend
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: /api/cars/delete-car/{id}
        [HttpDelete("delete-car/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteCar(int id)
        {
            var car = await _carService.GetCarById(id); 

            if (car == null)
            {
                return NotFound(new { message = "Car not found." });
            }

            await _vehicleService.DeleteVehicle(id);
            return Ok(new { message = "Car deleted successfully!" });
        }
        [HttpGet("models/{mark}")]
        public IActionResult GetModelsByMark(string mark)
        {
            var models = _carService.GetModelsByMark(mark);
            return Ok(models);
        }
    }
}
