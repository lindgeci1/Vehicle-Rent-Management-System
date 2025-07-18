using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Application.Middleware;
using VRMS.Application.Services;

namespace VRMS.UI.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("refresh-expiration")]
        public async Task<IActionResult> GetRefreshExpiration()
        {
            var expiry = await _userService.GetRefreshTokenExpirationFromCookie(HttpContext);

            if (expiry == null)
                return Unauthorized();

            return Ok(new { refreshExpiresAt = expiry });
        }


        [HttpGet("users")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<ActionResult<List<UserDto>>> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _userService.Login(loginDto.Email, loginDto.Password);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            try
            {
                var registeredUser = await _userService.Register(userDto);
                return Ok(new { Message = "User registered successfully.", User = registeredUser });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("delete-user/{userId}")]
        [AuthorizeRoles("Admin", "Agent", "Customer")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                await _userService.DeleteUser(userId);
                return Ok(new { Message = "User deleted successfully." });
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _userService.Logout();
                return Ok(new { Message = "User logged out successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }


        // Refresh token endpoint: Accepts a RefreshTokenDto and returns a new JWT token.
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var newJwtToken = await _userService.RefreshToken();
                return Ok(new { token = newJwtToken });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("check-refresh-token")]
        public async Task<IActionResult> CheckRefreshToken([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                bool isExpired = await _userService.IsRefreshTokenExpired(refreshTokenDto.RefreshToken);
                return Ok(new { expired = isExpired });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("send-verification-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] VerificationCodeDto dto)
        {
            var result = await _userService.SendVerificationCode(dto);
            if (result.GetType().GetProperty("error") != null)
                return BadRequest(result);

            return Ok(result);
        }
        [HttpPost("check-code")]
        public async Task<IActionResult> CheckCode([FromBody] CheckCodeDto dto)
        {
            var result = await _userService.CheckVerificationCode(dto);
            if (result.GetType().GetProperty("error") != null)
                return BadRequest(result);

            return Ok(result);
        }
        [HttpGet("email/{email}")]
        public async Task<IActionResult> GetUserByEmailOnly(string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailOnly(email);
                if (user == null)
                    return NotFound(new { error = "User not found" });

                return Ok(new { success = true, data = user });
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error in GetUserByEmailOnly:", ex.Message);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPut("update-password/{userId}")]
        public async Task<IActionResult> UpdateUserPassword(int userId, [FromBody] PasswordUpdateDto dto)
        {
            try
            {
                await _userService.UpdateUserPassword(userId, dto.Password);
                return Ok(new { success = true, message = "Password updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
}
