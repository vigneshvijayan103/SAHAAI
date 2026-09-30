using Sahaai.Application.Features.Reviews.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Reviews.Interfaces
{
    public interface IWorkerReviewService
    {
        Task<WorkerReviewDto> CreateReviewAsync(int userId, CreateWorkerReviewDto dto);
        Task<WorkerReviewDto?> GetReviewByRequestIdAsync(int requestId, int userId);
        Task<List<WorkerReviewDto>> GetAllReviewsForAdminAsync(int? workerUserId = null, int? minRating = null, int? maxRating = null);
        Task<List<WorkerRatingSummaryDto>> GetWorkerRatingSummariesAsync();
        Task<WorkerRatingSummaryDto?> GetWorkerRatingSummaryAsync(int workerUserId);
    }
}

