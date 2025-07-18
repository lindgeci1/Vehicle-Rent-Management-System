using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/vehicle-postconditions")]
    [ApiController]
    public class VehiclePostConditionController : ControllerBase
    {
        private readonly IVehiclePostConditionService _postConditionService;

        public VehiclePostConditionController(IVehiclePostConditionService postConditionService)
        {
            _postConditionService = postConditionService;
        }

        // GET: /api/vehicle-postconditions/postconditions
        [HttpGet("postconditions")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> GetAllPostConditions()
        {
            var result = await _postConditionService.GetAllVehiclePostConditions();
            return Ok(result);
        }

        // GET: /api/vehicle-postconditions/postcondition/{id}
        [HttpGet("postcondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> GetPostConditionById(Guid id)
        {
            var result = await _postConditionService.GetVehiclePostConditionById(id);
            if (result == null)
            {
                return NotFound(new { message = "Vehicle post-condition not found." });
            }
            return Ok(result);
        }

        // POST: /api/vehicle-postconditions/create-postcondition
        [HttpPost("create-postcondition")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> CreatePostCondition([FromBody] VehiclePostConditionDto dto)
        {
            try
            {
                var created = await _postConditionService.CreateVehiclePostCondition(dto);

                // Return the generated PDF as a file download:
                return File(
                    created.PostConditionPdf,
                    "application/pdf",
                    $"PostCondition_{created.Id}.pdf"
                );
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

        [HttpGet("{id:guid}/customer-username")]
        public async Task<IActionResult> GetUsernameForPostCondition(Guid id)
        {
            try
            {
                var username = await _postConditionService.GetCustomerUsernameByPreConditionId(id);
                return Ok(new { username });
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

        [HttpGet("download-postcondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DownloadPostConditionPdf(Guid id)
        {
            var postCondition = await _postConditionService.GetVehiclePostConditionById(id);
            if (postCondition == null || postCondition.PostConditionPdf == null || postCondition.PostConditionPdf.Length == 0)
                return NotFound(new { message = "Post-condition PDF not found." });

            return File(
                postCondition.PostConditionPdf,
                "application/pdf",
                $"PostCondition_{postCondition.Id}.pdf"
            );
        }
        //// PUT: /api/vehicle-postconditions/update-postcondition/{id}
        //[HttpPut("update-postcondition/{id}")]
        //[AuthorizeRoles("Admin", "Agent")]
        //public async Task<IActionResult> UpdatePostCondition(Guid id, [FromBody] VehiclePostConditionDto dto)
        //{
        //    if (id != dto.Id)
        //    {
        //        return BadRequest(new { message = "VehiclePostCondition ID mismatch." });
        //    }

        //    try
        //    {
        //        var updated = await _postConditionService.UpdateVehiclePostCondition(dto);
        //        return Ok(updated);
        //    }
        //    catch (ArgumentException ex)
        //    {
        //        return BadRequest(new { message = ex.Message });
        //    }
        //}

        // DELETE: /api/vehicle-postconditions/delete-postcondition/{id}
        [HttpDelete("delete-postcondition/{id}")]
        [AuthorizeRoles("Admin", "Agent")]
        public async Task<IActionResult> DeletePostCondition(Guid id)
        {
            try
            {
                await _postConditionService.DeleteVehiclePostCondition(id);
                return Ok(new { message = "Vehicle post-condition deleted successfully!" });
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

        [HttpGet("postcondition-by-vehicle/{vehicleId}")]
        public async Task<IActionResult> GetPostConditionByVehicleId(int vehicleId)
        {
            var result = await _postConditionService.GetVehiclePostConditionByVehicleId(vehicleId);
            if (result == null)
                return NotFound("Post-condition not found for this vehicle.");
            return Ok(result);
        }
    }
}
