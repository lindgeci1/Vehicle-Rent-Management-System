using VRMS.Domain.Entities;
using System;

namespace VRMS.Application.Dtos
{
    public class AgentDto
    {
        public AgentDto() { }

        public AgentDto(Agent agent)
        {
            UserId = agent.UserId;
            Email = agent.Email;
            Username = agent.Username;
            Password = agent.Password;
            WorkExperience = agent.WorkExperience;
            BranchLocation = agent.BranchLocation;
            JoinedDate = agent.JoinedDate;
        }

        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public int WorkExperience { get; set; }
        public string? BranchLocation { get; set; }
        public DateTime JoinedDate { get; set; }
    }
}
