using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.IdentityModel.Tokens;
namespace VRMS.Application.Middleware
{
    public class AuthorizeRolesAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string[] _roles;
        private readonly string _jwtSecret;

        public AuthorizeRolesAttribute(params string[] roles)
        {
            _roles = roles;
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                         ?? throw new Exception("JWT_SECRET environment variable is not set.");
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var request = context.HttpContext.Request;
            string authHeader = request.Headers["Authorization"].FirstOrDefault();

            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Authentication token is missing" });
                return;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret)),
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                // Extract roles from the token (assumes "role" or ClaimTypes.Role)
                var rolesFromToken = principal.Claims
                    .Where(c => c.Type == "role" || c.Type == ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList();

                if (!rolesFromToken.Any())
                {
                    context.Result = new UnauthorizedObjectResult(new { message = "No roles found in token" });
                    return;
                }

                bool hasRequiredRole = _roles.Any(r => rolesFromToken.Contains(r, StringComparer.OrdinalIgnoreCase));
                if (!hasRequiredRole)
                {
                    // Return a custom 403 Forbidden message:
                    context.Result = new ObjectResult(new { message = "Access Denied: Insufficient permissions" })
                    {
                        StatusCode = 403
                    };
                    return;
                }

                // Optionally, store the principal in HttpContext for later use.
                context.HttpContext.Items["User"] = principal;
            }
            catch (SecurityTokenExpiredException)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Authentication token has expired" });
                return;
            }
            catch (Exception)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid authentication token" });
                return;
            }

            await next();
        }
    }
}