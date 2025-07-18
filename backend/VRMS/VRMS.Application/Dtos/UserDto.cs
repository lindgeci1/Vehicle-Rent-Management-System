using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace VRMS.Application.Dtos
{
    public class UserDto
    {
        public UserDto() { }

        public UserDto(User user)
        {
            UserId = user.UserId;
            Email = user.Email;
            Username = user.Username;
            Password = user.Password;
            // Convert each UserRole into its Role name.
            RoleNames = user.UserRoles
                .Where(ur => ur.Role != null)
                .Select(ur => ur.Role!.Name)
                .ToList();

            // Optionally set RefreshToken and its expiry if they exist.
            RefreshToken = user.RefreshToken;
            RefreshTokenExpiryTime = user.RefreshTokenExpiryTime;
        }

        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? Password { get; set; }
        public List<string> RoleNames { get; set; } = new List<string>();

        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
    }
}
