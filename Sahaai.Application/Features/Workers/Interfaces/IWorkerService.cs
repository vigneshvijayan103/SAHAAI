using Sahaai.Application.Features.Workers.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Workers.Interfaces
{
    public interface IWorkerService
    {
        Task<WorkerProfileDto?> GetProfileAsync(int workerUserId);
        Task<WorkerProfileDto?> UpdateProfileAsync(int workerUserId, WorkerUpdateProfileDto dto);
        Task<string> GetWorkerStatusAsync(int workerUserId);
        Task<bool> UpdateAvailabilityAsync(int workerUserId, bool isOnline);
        Task<bool> UpdateAvailabilityStatusAsync(int workerUserId, string status);
        Task<bool> UpdateLocationAsync(int workerUserId, double latitude, double longitude);
        Task<List<WorkerJobDto>> GetAvailableJobsAsync(int workerUserId, double? latitude = null, double? longitude = null, double? radiusKm = null);
        Task<WorkerJobDto?> GetCurrentJobAsync(int workerUserId);
        Task<WorkerJobDto?> GetJobDetailsAsync(int workerUserId, int requestId);
        Task<List<WorkerJobDto>> GetJobHistoryAsync(int workerUserId);
        Task<bool> AcceptJobAsync(int workerUserId, int requestId);
        Task<(bool Success, string Message)> StartJobAsync(int workerUserId, int requestId, double? latitude = null, double? longitude = null);
        Task<bool> CompleteJobAsync(int workerUserId, int requestId, string? notes);
        Task<bool> RejectJobAsync(int workerUserId, int requestId, string? reason);
        Task<WorkerDashboardStatsDto> GetDashboardStatsAsync(int workerUserId);
        Task<(double? Latitude, double? Longitude)> GetWorkerLocationAsync(int workerUserId);
    }
}

