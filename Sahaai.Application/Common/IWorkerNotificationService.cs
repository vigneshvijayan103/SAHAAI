using System.Threading.Tasks;

namespace Sahaai.Application.Common
{
    public interface IWorkerNotificationService
    {
        Task NotifyUserRequestAcceptedAsync(int userId, int requestId, int workerId, string workerName, string? workerPhone = null, string? workerPhoto = null, double? workerLatitude = null, double? workerLongitude = null);
        Task NotifyUserRequestStartedAsync(int userId, int requestId);
        Task NotifyUserRequestCompletedAsync(int userId, int requestId);
        Task NotifyWorkerAssignedAsync(int workerUserId, int requestId, string serviceName);
        Task NotifyWorkerLocationUpdatedAsync(int workerUserId, int requestId, int customerUserId, double latitude, double longitude);
        Task NotifyUserDeactivatedAsync(int userId, string message = "Your account has been deactivated by an administrator.");
    }
}

