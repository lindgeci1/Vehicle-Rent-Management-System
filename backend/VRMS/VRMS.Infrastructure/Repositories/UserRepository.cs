using Microsoft.EntityFrameworkCore;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using VRMS.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly VRMSDbContext _context;

        public UserRepository(VRMSDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsers()
        {
            // Include roles as needed.
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .ToListAsync();
        }
        public async Task<string> GetUserRoleByUserId(int userId)
        {
            var userRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .FirstOrDefaultAsync(ur => ur.UserId == userId);
            return userRole?.Role?.Name;
        }

        public async Task<User?> GetUserByRefreshToken(string refreshToken)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        }
        public async Task<User?> GetUserById(int userId)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }

        public async Task<User?> Login(string email, string password)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> Register(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByUsername(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task DeleteUser(int userId)
        {
            var user = await GetUserById(userId);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        // New UpdateUser method.
        public async Task UpdateUser(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }


        public async Task<VerificationCode?> GetActiveVerificationCode(int userId)
        {
            return await _context.VerificationCodes
                .Where(vc => vc.UserId == userId && vc.Expiration > DateTime.UtcNow)
                .OrderByDescending(vc => vc.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task CreateVerificationCode(VerificationCode code)
        {
            await _context.VerificationCodes.AddAsync(code);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVerificationCode(int userId, string code)
        {
            var record = await _context.VerificationCodes
                .FirstOrDefaultAsync(vc => vc.UserId == userId && vc.Code == code);

            if (record != null)
            {
                _context.VerificationCodes.Remove(record);
                await _context.SaveChangesAsync();
            }
        }
        public async Task<VerificationCode?> GetVerificationCodeByUserAndCode(int userId, string code)
        {
            return await _context.VerificationCodes
                .Where(vc => vc.UserId == userId && vc.Code == code)
                .OrderByDescending(vc => vc.CreatedAt)
                .FirstOrDefaultAsync();
        }


    }
}
