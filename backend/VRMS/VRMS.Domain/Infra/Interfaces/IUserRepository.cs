using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllUsers();
        Task<User?> Login(string email, string password);
        Task<User?> Register(User user);
        Task DeleteUser(int userId);
        Task<User?> GetUserById(int userId);
        Task UpdateUser(User user); // <-- New method added

        Task<User?> GetUserByRefreshToken(string refreshToken);
        Task<User?> GetUserByEmail(string email);

        Task<User?> GetUserByUsername(string username);

        Task<string> GetUserRoleByUserId(int userId);

        Task<VerificationCode?> GetActiveVerificationCode(int userId);
        Task CreateVerificationCode(VerificationCode code);
        Task DeleteVerificationCode(int userId, string code);
        Task<VerificationCode?> GetVerificationCodeByUserAndCode(int userId, string code);

    }
}
