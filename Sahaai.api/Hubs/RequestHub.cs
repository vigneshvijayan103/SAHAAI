using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sahaai.Infrastructure.Data;
using System.Threading.Tasks;

namespace Sahaai.Api.Hubs
{
    public class RequestHub : Hub
    {
        private readonly AppDbContext _dbContext;

        public RequestHub(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task JoinWorkerGroup(string workerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, workerId);
        }

        public async Task JoinUserGroup(string userId)
        {
            if (int.TryParse(userId, out int uId))
            {
                var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == uId);
                if (user == null || user.IsDeleted || !user.IsActive)
                {
                    await Clients.Caller.SendAsync("ForceLogout", new
                    {
                        userId = uId,
                        message = "Your account has been deactivated by an administrator."
                    });
                    Context.Abort();
                    return;
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        public async Task JoinRequestGroup(string requestId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"request_{requestId}");
        }
    }
}
