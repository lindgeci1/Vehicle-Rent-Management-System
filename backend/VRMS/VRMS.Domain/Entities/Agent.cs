using System;

namespace VRMS.Domain.Entities
{
    public class Agent : User
    {
        public Agent(int userId, string email, string username, string password, int workExperience, string? branchLocation)
            : base(userId, email, username, password)
        {
            WorkExperience = workExperience;
            BranchLocation = branchLocation;
            JoinedDate = DateTime.UtcNow; // only default for creation
        }


        public int WorkExperience { get; set; }
        public string? BranchLocation { get; set; }
        public DateTime JoinedDate { get; set; }
    }
}
