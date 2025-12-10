using Microsoft.AspNetCore.SignalR;

namespace Sahaai.Api.Hubs
{
    public class NearbyHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Console.WriteLine($"Worker connected: {Context.ConnectionId}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? ex)
        {
            Console.WriteLine($"Worker disconnected: {Context.ConnectionId}");
            return base.OnDisconnectedAsync(ex);
        }
    }
}

















