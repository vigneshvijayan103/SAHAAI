using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Sahaai.Api.Hubs;
using Sahaai.Application.Common;
using System;
using System.Threading.Tasks;

namespace Sahaai.Api.Services
{
    public class WorkerNotificationService : IWorkerNotificationService
    {
        private readonly IHubContext<RequestHub> _requestHub;
        private readonly IHubContext<NearbyHub> _nearbyHub;
        private readonly ILogger<WorkerNotificationService> _logger;

        public WorkerNotificationService(
            IHubContext<RequestHub> requestHub,
            IHubContext<NearbyHub> nearbyHub,
            ILogger<WorkerNotificationService> logger)
        {
            _requestHub = requestHub;
            _nearbyHub = nearbyHub;
            _logger = logger;
        }

        public async Task NotifyUserRequestAcceptedAsync(
            int userId,
            int requestId,
            int workerId,
            string workerName,
            string? workerPhone = null,
            string? workerPhoto = null,
            double? workerLatitude = null,
            double? workerLongitude = null)
        {
            try
            {
                var payload = new
                {
                    requestId,
                    workerId,
                    workerName,
                    workerPhone,
                    workerPhoto,
                    workerLatitude,
                    workerLongitude,
                    status = "Accepted",
                    timestamp = DateTime.UtcNow
                };

                await _requestHub.Clients.Group(userId.ToString()).SendAsync("RequestAccepted", payload);
                await _requestHub.Clients.Group($"request_{requestId}").SendAsync("RequestAccepted", payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast RequestAccepted to SignalR user group {UserId}", userId);
            }
        }

        public async Task NotifyWorkerLocationUpdatedAsync(int workerUserId, int requestId, int customerUserId, double latitude, double longitude)
        {
            try
            {
                var payload = new
                {
                    requestId,
                    workerId = workerUserId,
                    latitude,
                    longitude,
                    timestamp = DateTime.UtcNow
                };

                await _requestHub.Clients.Group(customerUserId.ToString()).SendAsync("WorkerLocationUpdated", payload);
                await _requestHub.Clients.Group($"request_{requestId}").SendAsync("WorkerLocationUpdated", payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast WorkerLocationUpdated to SignalR group for request {RequestId}", requestId);
            }
        }

        public async Task NotifyUserRequestStartedAsync(int userId, int requestId)
        {
            try
            {
                var payload = new
                {
                    requestId,
                    status = "InProgress",
                    timestamp = DateTime.UtcNow
                };

                await _requestHub.Clients.Group(userId.ToString()).SendAsync("RequestStarted", payload);
                await _requestHub.Clients.Group($"request_{requestId}").SendAsync("RequestStarted", payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast RequestStarted to SignalR user group {UserId}", userId);
            }
        }

        public async Task NotifyUserRequestCompletedAsync(int userId, int requestId)
        {
            try
            {
                var payload = new
                {
                    requestId,
                    status = "Completed",
                    timestamp = DateTime.UtcNow
                };

                await _requestHub.Clients.Group(userId.ToString()).SendAsync("RequestCompleted", payload);
                await _requestHub.Clients.Group($"request_{requestId}").SendAsync("RequestCompleted", payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast RequestCompleted to SignalR user group {UserId}", userId);
            }
        }

        public async Task NotifyWorkerAssignedAsync(int workerUserId, int requestId, string serviceName)
        {
            try
            {
                await _requestHub.Clients.Group(workerUserId.ToString()).SendAsync("JobAssigned", new
                {
                    requestId,
                    serviceName,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast JobAssigned to SignalR worker group {WorkerId}", workerUserId);
            }
        }

        public async Task NotifyUserDeactivatedAsync(int userId, string message = "Your account has been deactivated by an administrator.")
        {
            try
            {
                var payload = new
                {
                    userId,
                    message,
                    timestamp = DateTime.UtcNow
                };

                await _requestHub.Clients.Group(userId.ToString()).SendAsync("ForceLogout", payload);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast ForceLogout to SignalR group {UserId}", userId);
            }
        }
    }
}

