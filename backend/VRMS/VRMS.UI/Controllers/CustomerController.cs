
using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/customers")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }
        // GET: /api/customers/customers
        [HttpGet("customers")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _customerService.GetAllCustomers();
            return Ok(customers);
        }

        // GET: /api/customers/customer/{id}
        [HttpGet("customer/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _customerService.GetCustomerById(id);

            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }
            return Ok(customer);
        }

        // POST: /api/customers/create-customer
        [HttpPost("create-customer")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateCustomer([FromBody] CustomerDto customerDto)
        {
            try
            {
                var created = await _customerService.CreateCustomer(customerDto); // ✅ return object
                return Ok(created); // ✅ send full DTO
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/customers/update-customer/{id}
        [HttpPut("update-customer/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] CustomerDto customerDto)
        {
            if (id != customerDto.UserId) // Ensure the ID matches the one provided in the DTO
            {
                return BadRequest(new { message = "Customer ID mismatch." });
            }

            try
            {
                var updated = await _customerService.UpdateCustomer(customerDto); // ✅ return object
                return Ok(updated); // ✅ send full DTO
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // DELETE: /api/customers/delete-customer/{id}
        [HttpDelete("delete-customer/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _customerService.GetCustomerById(id);

            // Check if the customer exists
            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            // Proceed with deletion if the customer exists
            await _customerService.DeleteCustomer(id);
            return Ok(new { message = "Customer deleted successfully!" });
        }

    }
}





