using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using VRMS.Application.Dtos;
using VRMS.Application.Interface;
using VRMS.Domain.Entities;
using VRMS.Domain.Infra.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace VRMS.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly string _jwtSecret;
        private readonly IVehicleService _vehicleService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public UserService(IUserRepository userRepository, IServiceScopeFactory scopeFactory, IVehicleService vehicleService, IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _scopeFactory = scopeFactory;
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                         ?? throw new Exception("JWT_SECRET environment variable is null or empty!");
            _vehicleService = vehicleService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = await _userRepository.GetAllUsers();
            return users.Select(u => new UserDto(u)).ToList();
        }

        public async Task<UserDto?> Login(string email, string password)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new Exception("Email is required.");
            if (string.IsNullOrWhiteSpace(password))
                throw new Exception("Password is required.");

            var user = await _userRepository.Login(email, password);
            if (user == null)
                throw new Exception("Email does not exist.");

            bool passwordMatch = BCrypt.Net.BCrypt.Verify(password, user.Password);
            if (!passwordMatch)
                throw new Exception("Incorrect password.");

            var logs = await _vehicleService.UpdateVehicleAvailabilityForToday();
            Console.WriteLine("[VehicleAvailability] Login.");
            foreach (var log in logs)
            {
                Console.WriteLine(log);
            }

            // Retrieve the user's role using the new repository function
            string roleName = await _userRepository.GetUserRoleByUserId(user.UserId);
            if (string.IsNullOrEmpty(roleName))
                roleName = "Customer"; // Default if no role is found
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("userId", user.UserId.ToString()),
                new Claim("username", user.Username),
                new Claim("email", user.Email),
                new Claim("role", roleName)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds
            );

            var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            var refreshToken = GenerateRefreshToken();
            var refreshTokenExpiryTime = DateTime.Now.AddHours(1);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = refreshTokenExpiryTime;
            await _userRepository.UpdateUser(user);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Use HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = refreshTokenExpiryTime
            };

            _httpContextAccessor.HttpContext.Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
            //_httpContextAccessor.HttpContext.Response.Cookies.Append("refreshExpiresAt", refreshTokenExpiryTime.ToString("o"), cookieOptions);
            return new UserDto(user)
            {
                Token = jwtToken,
                RefreshToken = refreshToken,
                RefreshTokenExpiryTime = refreshTokenExpiryTime
            };
        }

        public async Task<UserDto?> Register(UserDto userDto)
        {
            if (string.IsNullOrWhiteSpace(userDto.Email) ||
                string.IsNullOrWhiteSpace(userDto.Username) ||
                string.IsNullOrWhiteSpace(userDto.Password))
            {
                throw new Exception("Email, Username and Password are required.");
            }

            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            if (!emailRegex.IsMatch(userDto.Email))
                throw new Exception("Invalid email format.");

            if (userDto.Username.Any(c => !char.IsLetter(c)))
            {
                throw new ArgumentException("Username should only contain letters.");
            }

            if (userDto.Username.Length <= 4)
            {
                throw new ArgumentException("Username must be more than 4 characters.");
            }

            var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
            if (!passwordRegex.IsMatch(userDto.Password))
            {
                throw new Exception("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }

            var existingUserByEmail = await _userRepository.GetUserByEmail(userDto.Email);
            if (existingUserByEmail != null)
                throw new Exception("A user with this email already exists.");


            var existingUserByUsername = await _userRepository.GetUserByUsername(userDto.Username);
            if (existingUserByUsername != null)
                throw new Exception("A user with this username already exists.");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);

            var newCustomer = new Customer(
                userDto.UserId,
                userDto.Email,
                userDto.Username,
                hashedPassword,
                driverLicense: "-",
                address: "-",
                phoneNumber: "-"
            );

            newCustomer.UserRoles.Add(new UserRole(newCustomer.UserId, 1));

            var registeredCustomer = await _userRepository.Register(newCustomer);
            if (registeredCustomer == null)
                throw new Exception("Registration failed.");
            _ = Task.Run(async () =>
            {
                var emailService = new EmailTemplate();
                await emailService.SendWelcomeEmail(userDto.Email, userDto.Username);
            });
            Console.WriteLine($"✅ Registration successful. Welcome email sent to {userDto.Email}");
            return new UserDto(registeredCustomer);
        }

        public async Task DeleteUser(int userId)
        {
            var existingUser = await _userRepository.GetUserById(userId);
            if (existingUser == null)
                throw new Exception($"User with ID {userId} does not exist.");

            await _userRepository.DeleteUser(userId);
        }

        public async Task Logout()
        {
            var context = _httpContextAccessor.HttpContext;
            var refreshToken = context?.Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new Exception("Refresh token is required.");

            var user = await _userRepository.GetUserByRefreshToken(refreshToken);
            if (user == null)
                throw new Exception("Invalid refresh token.");

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userRepository.UpdateUser(user);

            // Expire the cookies
            var expiredCookie = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UnixEpoch
            };

            context.Response.Cookies.Append("refreshToken", "", expiredCookie);
            //context.Response.Cookies.Append("refreshExpiresAt", "", expiredCookie);
        }

        public async Task<string> RefreshToken()
        {
            var refreshToken = _httpContextAccessor.HttpContext?.Request.Cookies["refreshToken"];
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new Exception("Refresh token is missing from cookies.");

            var user = await _userRepository.GetUserByRefreshToken(refreshToken);
            if (user == null)
                throw new Exception("Invalid refresh token.");

            if (user.RefreshTokenExpiryTime == null || DateTime.Now > user.RefreshTokenExpiryTime)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userRepository.UpdateUser(user);
                throw new Exception("Refresh token expired. Please log in again.");
            }

            // Retrieve the user's role
            string roleName = await _userRepository.GetUserRoleByUserId(user.UserId);
            if (string.IsNullOrEmpty(roleName))
                roleName = "Customer";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim("userId", user.UserId.ToString()),
                new Claim("username", user.Username),
                new Claim("email", user.Email),
                new Claim("role", roleName)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
                signingCredentials: creds
            );

            var newJwtToken = new JwtSecurityTokenHandler().WriteToken(token);
            return newJwtToken;
        }

        private string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString();
        }

        public async Task<bool> IsRefreshTokenExpired(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                throw new Exception("Refresh token required.");

            var user = await _userRepository.GetUserByRefreshToken(refreshToken);
            if (user == null)
                throw new Exception("Invalid refresh token.");

            if (user.RefreshTokenExpiryTime == null || DateTime.Now > user.RefreshTokenExpiryTime)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userRepository.UpdateUser(user);
                return true;
            }
            return false;
        }

        public async Task<object> SendVerificationCode(VerificationCodeDto dto)
        {
            try
            {
                var user = await _userRepository.GetUserByEmail(dto.Email);
                if (user == null)
                {
                    Console.WriteLine($"❌ User not found for email: {dto.Email}");
                    return new { error = "Email does not exist" };
                }

                var activeCode = await _userRepository.GetActiveVerificationCode(user.UserId);
                if (activeCode != null)
                {
                    await _userRepository.DeleteVerificationCode(user.UserId, activeCode.Code);
                    Console.WriteLine("♻️ Previous active verification code deleted");
                }

                var code = new Random().Next(100000, 999999).ToString();
                var newCode = new VerificationCode(0, user.Email!, code, DateTime.UtcNow.AddMinutes(1), user.UserId);

                await _userRepository.CreateVerificationCode(newCode);

                _ = Task.Run(async () =>
                {
                    var emailService = new EmailTemplate();
                    await emailService.SendVerificationCodeEmail(user.Email, user.Username, code);
                });

                var timer = new System.Timers.Timer(60000); // back to 1 minute

                timer.Elapsed += async (sender, args) =>
                {
                    timer.Stop();
                    try
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var scopedRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
                        await scopedRepo.DeleteVerificationCode(user.UserId, code);
                        Console.WriteLine($"⏳ [TIMER] Deleted code {code} for {user.Email}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ [TIMER ERROR] {ex.Message}");
                    }
                };
                timer.AutoReset = false;
                timer.Start();


                return new { success = true, message = "Verification code sent successfully", code };
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error sending verification code: " + ex.Message);
                return new { error = "Internal server error" };
            }
        }

        public async Task<object> CheckVerificationCode(CheckCodeDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Code) || dto.Code.Length != 6 || !dto.Code.All(char.IsDigit))
                    return new { error = "Invalid verification code. The code must be 6 digits long." };

                var user = await _userRepository.GetUserByEmail(dto.Email);
                if (user == null)
                    return new { error = "Email does not exist" };

                var record = await _userRepository.GetVerificationCodeByUserAndCode(user.UserId, dto.Code);
                if (record == null)
                    return new { error = "Invalid verification code" };

                if (record.Expiration < DateTime.UtcNow)
                    return new { error = "Verification code has expired" };

                Console.WriteLine("✅ Verification code is valid");
                return new { success = true, message = "Verification code is valid" };
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ Error checking verification code: " + ex.Message);
                return new { error = "Internal server error" };
            }


        }
        public async Task<UserDto?> GetUserByEmailOnly(string email)
        {
            var user = await _userRepository.GetUserByEmail(email);
            if (user == null)
                return null;
            return new UserDto(user);
        }
        public async Task<DateTime?> GetRefreshTokenExpirationFromCookie(HttpContext context)
        {
            var refreshToken = context.Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            var user = await _userRepository.GetUserByRefreshToken(refreshToken);
            return user?.RefreshTokenExpiryTime;
        }

        public async Task UpdateUserPassword(int userId, string newPassword)
        {
            var user = await _userRepository.GetUserById(userId);
            if (user == null)
                throw new Exception("User not found.");

            // ✅ Check if new password is the same as the current one
            bool isSamePassword = BCrypt.Net.BCrypt.Verify(newPassword, user.Password);
            if (isSamePassword)
                throw new Exception("You entered the old password!");

            // ✅ Password validation
            var passwordRegex = new Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$");
            if (!passwordRegex.IsMatch(newPassword))
            {
                throw new ArgumentException("Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
            await _userRepository.UpdateUser(user);

            _ = Task.Run(async () =>
            {
                var emailService = new EmailTemplate();
                await emailService.SendPasswordChangedEmail(user.Email!, user.Username);
            });
        }
    }
}