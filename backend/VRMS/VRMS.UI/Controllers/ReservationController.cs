using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;
using VRMS.Domain.Entities;

namespace VRMS.UI.Controllers
{
    [Route("api/reservations")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

      
        [HttpGet("reservations")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllReservations()
        {
            var reservations = await _reservationService.GetAllReservations();
            return Ok(reservations);
        }

        [HttpGet("reservation/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetReservation(int id)
        {
            var reservation = await _reservationService.GetReservationById(id);

            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found." });
            }
            return Ok(reservation);
        }

        [HttpPost("create-reservation")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationDto reservationDto)
        {
            try
            {
                var createdR = await _reservationService.CreateReservation(reservationDto);
                return Ok(createdR);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/reservation/update-reservation/{id}
        [HttpPut("update-reservation/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationDto reservationDto)
        {
            if (id != reservationDto.ReservationId)
            {
                return BadRequest(new { message = "Reservation ID is not correct!." });
            }

            try
            {
                var updatedR = await _reservationService.UpdateReservation(reservationDto);
                return Ok(updatedR);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-reservation/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _reservationService.GetReservationById(id);

            if (reservation == null)
            {
                return NotFound(new { message = "Reservation not found." });
            }

            await _reservationService.DeleteReservation(id);
            return Ok(new { message = "Reservation deleted successfully!" });
        }

        [HttpGet("customer-by-reservation/{reservationId}")]
        public async Task<IActionResult> GetCustomerByReservationId(int reservationId)
        {
            var customer = await _reservationService.GetCustomerByReservationId(reservationId);
            return customer != null ? Ok(customer) : NotFound("Customer not found.");
        }
        // Toggle PickedUp status
        [HttpPut("toggle-pickedup/{reservationId}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> TogglePickedUp(int reservationId)
        {
            try
            {
                await _reservationService.TogglePickedUp(reservationId);
                return Ok(new { message = "PickedUp status updated successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // ✅ shows in Swagger and frontend
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        // Toggle BroughtBack status
        [HttpPut("toggle-broughtback/{reservationId}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> ToggleBroughtBack(int reservationId)
        {
            try
            {
                await _reservationService.ToggleBroughtBack(reservationId);
                return Ok(new { message = "BroughtBack status toggled successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message }); // ✅ shows validation errors
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("user/{customerId}")]
        [AuthorizeRoles("Customer", "Admin", "Agent")]
        public async Task<IActionResult> GetReservationsByCustomer(int customerId)
        {
            var reservations = await _reservationService.GetReservationsByCustomerId(customerId);
            return Ok(reservations);
        }

    }
}
