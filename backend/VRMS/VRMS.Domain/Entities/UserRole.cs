using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Domain.Entities
{
    public class UserRole
    {

        public UserRole(int userId, int roleId)
        {
            UserId = userId;
            RoleId = roleId;
        }

        public int UserId { get; set; }
        public User? User { get; set; } // ✅ Nullable to avoid EF warnings

        public int RoleId { get; set; }
        public Role? Role { get; set; } // ✅ Nullable to avoid EF warnings

    }
}

