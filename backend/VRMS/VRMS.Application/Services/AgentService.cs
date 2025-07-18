using VRMS.Application.Dtos;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System;
using System.Text.RegularExpressions;
using VRMS.Infrastructure.Repositories;
using VRMS.Application.Interface;

namespace VRMS.Application.Services
{
    public class AgentService : IAgentService
    {
        private readonly IAgentRepository _agentRepository;
        private readonly IUserRepository _userRepository; // Added dependency

        public AgentService(IAgentRepository agentRepository, IUserRepository userRepository)
        {
            _agentRepository = agentRepository;
            _userRepository = userRepository;
        }


        // Register a new agent
        public async Task<AgentDto> CreateAgent(AgentDto agentDto)
        {
            if (string.IsNullOrEmpty(agentDto.Email) &&
                string.IsNullOrEmpty(agentDto.Username) &&
                string.IsNullOrEmpty(agentDto.Password) &&
                agentDto.WorkExperience == 0 &&
                string.IsNullOrEmpty(agentDto.BranchLocation))
            {
                throw new ArgumentException("All fields are required.");
            }

            if (string.IsNullOrEmpty(agentDto.Email))
                throw new ArgumentException("Email is required.");

            if (!Regex.IsMatch(agentDto.Email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"))
                throw new ArgumentException("Invalid email format.");

            if (string.IsNullOrEmpty(agentDto.Username))
                throw new ArgumentException("Username is required.");

            if (agentDto.Username.Any(c => !char.IsLetter(c)))
                throw new ArgumentException("Username should only contain letters.");

            if (agentDto.Username.Length <= 4)
                throw new ArgumentException("Username must be more than 4 characters.");

            if (string.IsNullOrEmpty(agentDto.Password))
                throw new ArgumentException("Password is required.");

            var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
            if (!passwordRegex.IsMatch(agentDto.Password))
            {
                throw new ArgumentException("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }

            if (agentDto.WorkExperience <= 0 || agentDto.WorkExperience > 20)
                throw new ArgumentException("Work experience must be between 1 and 20 years.");

            if (string.IsNullOrEmpty(agentDto.BranchLocation))
                throw new ArgumentException("Branch location is required.");

            // Check for duplicates
            var existingUserByEmail = await _userRepository.GetUserByEmail(agentDto.Email);
            if (existingUserByEmail != null)
                throw new Exception("A user with this email already exists.");

            var existingUserByUsername = await _userRepository.GetUserByUsername(agentDto.Username);
            if (existingUserByUsername != null)
                throw new Exception("A user with this username already exists.");

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(agentDto.Password);

            // Map to Agent entity
            var agent = new Agent(
                userId: agentDto.UserId,
                email: agentDto.Email,
                username: agentDto.Username,
                password: hashedPassword,
                workExperience: agentDto.WorkExperience,
                branchLocation: agentDto.BranchLocation
            );

            // Assign default role (Agent = 2)
            agent.UserRoles.Add(new UserRole(agent.UserId, 2));

            await _agentRepository.AddAgent(agent);
            return new AgentDto(agent); // ✅ return the newly created agent
        }

        // Update agent details
        public async Task<AgentDto> UpdateAgent(AgentDto agentDto)
        {
            if (string.IsNullOrEmpty(agentDto.Email) &&
                string.IsNullOrEmpty(agentDto.Username) &&
                agentDto.WorkExperience == 0 &&
                string.IsNullOrEmpty(agentDto.BranchLocation) &&
                string.IsNullOrEmpty(agentDto.Password))
            {
                throw new ArgumentException("All fields are required.");
            }

            if (string.IsNullOrEmpty(agentDto.Email))
                throw new ArgumentException("Email is required.");

            if (!Regex.IsMatch(agentDto.Email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"))
                throw new ArgumentException("Invalid email format.");

            if (string.IsNullOrEmpty(agentDto.Username))
                throw new ArgumentException("Username is required.");

            if (agentDto.Username.Any(c => !char.IsLetter(c)))
                throw new ArgumentException("Username should only contain letters.");

            if (agentDto.Username.Length <= 4)
                throw new ArgumentException("Username must be more than 4 characters.");

            if (agentDto.WorkExperience <= 0 || agentDto.WorkExperience > 20)
                throw new ArgumentException("Work experience must be between 1 and 20 years.");

            if (string.IsNullOrEmpty(agentDto.BranchLocation))
                throw new ArgumentException("Branch location is required.");

            var existingAgentById = await _agentRepository.GetAgentById(agentDto.UserId);
            if (existingAgentById == null)
                throw new ArgumentException("Agent not found.");

            var existingUserByEmail = await _userRepository.GetUserByEmail(agentDto.Email);
            if (existingUserByEmail != null && existingUserByEmail.UserId != agentDto.UserId)
                throw new Exception("A user with this email already exists.");

            var existingUserByUsername = await _userRepository.GetUserByUsername(agentDto.Username);
            if (existingUserByUsername != null && existingUserByUsername.UserId != agentDto.UserId)
                throw new Exception("A user with this username already exists.");

            string hashedPassword = existingAgentById.Password;
            bool passwordChanged = false;

            if (!string.IsNullOrWhiteSpace(agentDto.Password))
            {
                bool isSame = BCrypt.Net.BCrypt.Verify(agentDto.Password, existingAgentById.Password);
                if (!isSame)
                {
                    var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
                    if (!passwordRegex.IsMatch(agentDto.Password))
                        throw new ArgumentException("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");

                    hashedPassword = BCrypt.Net.BCrypt.HashPassword(agentDto.Password);
                    passwordChanged = true;
                    Console.WriteLine($"✅ Password was changed and re-hashed for user: {agentDto.Email}");
                }
            }
            else
            {
                Console.WriteLine($"ℹ️ Password was not changed for user: {agentDto.Email}");
            }

            string? existingRefreshToken = existingAgentById.RefreshToken;
            DateTime? existingRefreshExpiry = existingAgentById.RefreshTokenExpiryTime;

            var agent = new Agent(
                userId: agentDto.UserId,
                email: agentDto.Email,
                username: agentDto.Username,
                password: hashedPassword,
                workExperience: agentDto.WorkExperience,
                branchLocation: agentDto.BranchLocation
            )
            {
                RefreshToken = existingRefreshToken,
                RefreshTokenExpiryTime = existingRefreshExpiry
            };

            agent.UserRoles = existingAgentById.UserRoles;

            await _agentRepository.UpdateAgent(agent);
            return new AgentDto(agent); // ✅ return the updated agent
        }


        // Get an agent by their ID
        public async Task<AgentDto> GetAgentById(int agentId)
        {
            var agent = await _agentRepository.GetAgentById(agentId);

            if (agent != null)
            {
                return new AgentDto(agent);
            }

            return null; // Return null if agent is not found
        }

        // Delete an agent by ID
        public async Task DeleteAgent(int agentId)
        {
            var existingAgent = await _agentRepository.GetAgentById(agentId);
            if (existingAgent == null)
            {
                throw new ArgumentException("Agent not found.");
            }

            // Delete the agent from the repository
            await _userRepository.DeleteUser(agentId);
        }

        // Get all agents
        public async Task<IEnumerable<AgentDto>> GetAllAgents()
        {
            var agents = await _agentRepository.GetAllAgents();

            return agents.Select(a => new AgentDto(a)); // Map each Agent entity to an AgentDto
        }
    }
}
