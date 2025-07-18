using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class Role
    {
        public int RoleId { get; set; }
        public string? Name { get; set; } // ✅ Now nullable, no warnings

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();


        // ✅ Use this constructor for manual object creation
        public Role(int roleId, string name)
        {
            RoleId = roleId;
            Name = name;
        }
    }
}
