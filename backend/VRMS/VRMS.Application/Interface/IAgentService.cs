using VRMS.Application.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Application.Interface
{
    public interface IAgentService
    {
        // Method to register or create a new agent
        Task<AgentDto> CreateAgent(AgentDto agentDto);

        // Method to get an agent by their ID
        Task<AgentDto> GetAgentById(int agentId);

        // Method to update an existing agent
        Task<AgentDto> UpdateAgent(AgentDto agentDto);

        // Method to delete an agent by their ID
        Task DeleteAgent(int agentId);

        // Method to get all agents (optional)
        Task<IEnumerable<AgentDto>> GetAllAgents();
    }
}
