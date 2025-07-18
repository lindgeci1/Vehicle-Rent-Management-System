using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.EntityFrameworkCore;
using VRMS.Infrastructure.Data;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace VRMS.Infrastructure.Repositories
{
    public class AgentRepository : IAgentRepository
    {
        private readonly VRMSDbContext _context;

        public AgentRepository(VRMSDbContext context)
        {
            _context = context;
        }

        // Method to add a new agent
        public async Task AddAgent(Agent agent)
        {
            await _context.Agents.AddAsync(agent); // Add the agent to the DbContext
            await _context.SaveChangesAsync(); // Save changes to the database
        }

        // Method to get an agent by their ID
        public async Task<Agent> GetAgentById(int agentId)
        {
            return await _context.Agents.AsNoTracking()  // Use AsNoTracking to prevent tracking issues
                .FirstOrDefaultAsync(a => a.UserId == agentId); // Get agent by UserId
        }


        // Method to update an existing agent's data
        public async Task UpdateAgent(Agent agent)
        {
            // Check if an instance with the same key is already tracked
            var localAgent = _context.Agents.Local.FirstOrDefault(a => a.UserId == agent.UserId);
            if (localAgent != null)
            {
                // Update the tracked instance with new values
                _context.Entry(localAgent).CurrentValues.SetValues(agent);
            }
            else
            {
                // Otherwise, attach the entity (if it's not already tracked)
                _context.Agents.Update(agent);
            }
            await _context.SaveChangesAsync();
        }

        // Method to delete an agent by their ID
        public async Task DeleteAgent(int agentId)
        {
            var agent = await GetAgentById(agentId);
            if (agent != null)
            {
                _context.Agents.Remove(agent); // Remove the agent from the DbContext
                await _context.SaveChangesAsync(); // Save changes to the database
            }
        }

        // Method to get all agents (optional)
        public async Task<IEnumerable<Agent>> GetAllAgents()
        {
            return await _context.Agents.AsNoTracking().ToListAsync(); // Get all agents without tracking
        }
    }
}
