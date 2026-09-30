using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Sahaai.Infrastructure.Data;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sahaai.Api.Middleware
{
    public class ActiveUserMiddleware
    {
        private readonly RequestDelegate _next;

        public ActiveUserMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst("userId")?.Value 
                               ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(userIdClaim, out int userId))
                {
                    var user = await dbContext.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.Id == userId);

                    if (user == null || user.IsDeleted || !user.IsActive)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var response = new
                        {
                            statusCode = StatusCodes.Status401Unauthorized,
                            message = "Your account has been deactivated by administrator.",
                            errorType = "AccountDeactivated"
                        };

                        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        return;
                    }
                }
            }

            await _next(context);
        }
    }
}

