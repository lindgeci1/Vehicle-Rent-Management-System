using System;
using System.Collections.Generic;

namespace VRMS.Domain.Entities
{
    public class VerificationCode
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty; // ✅ Required
        public string Code { get; set; } = string.Empty; // ✅ 6-digit verification code
        public DateTime Expiration { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // ✅ Many-to-One Relationship with User
        public int UserId { get; set; }
        public User? User { get; set; }

        // ✅ Constructor for manual object creation
        public VerificationCode(int id, string email, string code, DateTime expiration, int userId)
        {
            Id = id;
            Email = email;
            Code = code;
            Expiration = expiration;
            UserId = userId;
        }
    }
}
