using VRMS.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace VRMS.Application.Interface
{
    public interface IUserService
    {
        Task UpdateUserPassword(int userId, string newPassword);
        Task<List<UserDto>> GetAllUsers();
        Task<UserDto?> Login(string email, string password);
        Task<UserDto?> Register(UserDto userDto);
        Task DeleteUser(int userId);

        Task Logout();

        Task<string> RefreshToken();

        Task<bool> IsRefreshTokenExpired(string refreshToken);
        Task<object> SendVerificationCode(VerificationCodeDto dto);
        Task<object> CheckVerificationCode(CheckCodeDto dto);
        Task<UserDto?> GetUserByEmailOnly(string email);
        Task<DateTime?> GetRefreshTokenExpirationFromCookie(HttpContext context);
    }
}
