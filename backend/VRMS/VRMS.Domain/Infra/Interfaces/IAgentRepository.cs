using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IAgentRepository
    {
        // Method to register or add a new agent
        Task AddAgent(Agent agent);

        // Method to get an agent by their ID
        Task<Agent> GetAgentById(int agentId);

        // Method to update an existing agent
        Task UpdateAgent(Agent agent);

        // Method to delete an agent by their ID
        Task DeleteAgent(int agentId);

        // Method to get all agents (optional)
        Task<IEnumerable<Agent>> GetAllAgents();
    }
}
