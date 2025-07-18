using VRMS.Application.Dtos;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using VRMS.Application.Middleware;
using VRMS.Application.Interface;

namespace VRMS.UI.Controllers
{
    [Route("api/agents")]
    [ApiController]
    public class AgentController : ControllerBase
    {
        private readonly IAgentService _agentService;

        public AgentController(IAgentService agentService)
        {
            _agentService = agentService;
        }

        // GET: /api/agents/agents
        [HttpGet("agents")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAllAgents()
        {
            var agents = await _agentService.GetAllAgents();
            return Ok(agents);
        }

        // GET: /api/agents/agent/{id}
        [HttpGet("agent/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> GetAgent(int id)
        {
            var agent = await _agentService.GetAgentById(id);

            if (agent == null)
            {
                return NotFound(new { message = "Agent not found." });
            }
            return Ok(agent);
        }

        // POST: /api/agents/create-agent
        [HttpPost("create-agent")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> CreateAgent([FromBody] AgentDto agentDto)
        {
            try
            {
                var created = await _agentService.CreateAgent(agentDto); // ✅ get created object
                return Ok(created); // ✅ return the object instead of just a message
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

        // PUT: /api/agents/update-agent/{id}
        [HttpPut("update-agent/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> UpdateAgent(int id, [FromBody] AgentDto agentDto)
        {
            if (id != agentDto.UserId)
            {
                return BadRequest(new { message = "Agent ID mismatch." });
            }

            try
            {
                var updated = await _agentService.UpdateAgent(agentDto); // ✅ get updated object
                return Ok(updated); // ✅ return the object
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


        // DELETE: /api/agents/delete-agent/{id}
        [HttpDelete("delete-agent/{id}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteAgent(int id)
        {
            var agent = await _agentService.GetAgentById(id);

            // Check if the agent exists
            if (agent == null)
            {
                return NotFound(new { message = "Agent not found." });
            }

            // Proceed with deletion if the agent exists
            await _agentService.DeleteAgent(id);
            return Ok(new { message = "Agent deleted successfully!" });
        }
    }
}
