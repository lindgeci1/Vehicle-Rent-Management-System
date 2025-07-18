using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string? Email { get; set; } // ✅ Now nullable, no warnings
        public string? Username { get; set; } // ✅ Now nullable
        public string? Password { get; set; } // ✅ Now nullable

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // ✅ One-to-Many Relationship with VerificationCodes
        public ICollection<VerificationCode> VerificationCodes { get; set; } = new List<VerificationCode>();

        // ✅ Use this constructor for manual object creation
        public User(int userId, string email, string username, string password)
        {
            UserId = userId;
            Email = email;
            Username = username;
            Password = password;
        }
    }
}
