using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Reviews.Interfaces
{
    public interface IWorkerReviewRepository : IGenericRepository<WorkerReview>
    {
        Task<WorkerReview?> GetByServiceRequestIdAsync(int serviceRequestId);
        Task<List<WorkerReview>> GetByWorkerUserIdAsync(int workerUserId);
        Task<List<WorkerReview>> GetAllAsync(int? workerUserId = null, int? minRating = null, int? maxRating = null);
    }
}

