using Microsoft.AspNetCore.SignalR;

namespace Sahaai.Api.Hubs
{
    public class RequestHub:Hub
    {
        public async Task JoinWorkerGroup(string workerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, workerId);
        }

        public async Task JoinUserGroup(string userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
    }
}
