using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/insurancePolicy")]
    [ApiController]
    public class InsurancePolicyController : ControllerBase
    {
        private readonly IInsurancePolicyService _insurancePolicyService;

        public InsurancePolicyController(IInsurancePolicyService insurancePolicyService)
        {
            _insurancePolicyService = insurancePolicyService;
        }

        [HttpGet("insurancePolicies")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllInsurancePolicies()
        {
            var ips = await _insurancePolicyService.GetAllInsurancePolicies();
            return Ok(ips);
        }

        [HttpGet("insurancePolicy/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetInsurancePolicy(int id)
        {
            var ip = await _insurancePolicyService.GetInsurancePolicyById(id);
          
            if (ip == null)
            {
                return NotFound(new { message = "Insurance Policy not found." });
            }
            return Ok(ip);
        }

        [HttpPost("create-insurancePolicy")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateInsurancePolicy([FromBody] InsurancePolicyDto insurancePolicyDto)
        {
            try
            {
                var createdIP = await _insurancePolicyService.CreateInsurancePolicy(insurancePolicyDto);
                return Ok(createdIP);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("update-insurancePolicy/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateInsurancePolicy(int id, [FromBody] InsurancePolicyDto insurancePolicyDto)
        {
            if (id != insurancePolicyDto.InsurancePolicyId)
            {
                return BadRequest(new { message = "Insurance Policy ID is not correct!." });
            }

            try
            {
                var updatedIS = await _insurancePolicyService.UpdateInsurancePolicy(insurancePolicyDto); 
                return Ok(updatedIS); 
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("delete-insurancePolicy/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteInsurancePolicy(int id)
        {
            var ip = await _insurancePolicyService.GetInsurancePolicyById(id);

            if (ip == null)
            {
                return NotFound(new { message = "Insurance Policy not found." });
            }

            await _insurancePolicyService.DeleteInsurancePolicy(id);
            return Ok(new { message = "Insurance Policy deleted successfully!" });
        }

        [HttpGet("providers")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public IActionResult GetProvider([FromQuery] string providerName)
        {
            var provider = _insurancePolicyService.GetAvailableInsuranceProviders(providerName);

            if (provider == null || provider.Count == 0)
                return NotFound(new { message = "Provider not found." });

            return Ok(provider);
        }

    }
}
