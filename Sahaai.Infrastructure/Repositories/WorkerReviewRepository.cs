using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Reviews.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class WorkerReviewRepository : GenericRepository<WorkerReview>, IWorkerReviewRepository
    {
        public WorkerReviewRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<WorkerReview?> GetByServiceRequestIdAsync(int serviceRequestId)
        {
            return await _dbSet
                .Include(r => r.User)
                .Include(r => r.WorkerUser)
                .Include(r => r.ServiceRequest)
                .FirstOrDefaultAsync(r => r.ServiceRequestId == serviceRequestId && !r.IsDeleted);
        }

        public override async Task<WorkerReview?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(r => r.User)
                .Include(r => r.WorkerUser)
                .Include(r => r.ServiceRequest)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);
        }

        public async Task<List<WorkerReview>> GetByWorkerUserIdAsync(int workerUserId)
        {
            return await _dbSet
                .Include(r => r.User)
                .Include(r => r.WorkerUser)
                .Include(r => r.ServiceRequest)
                .Where(r => r.WorkerUserId == workerUserId && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();
        }

        public async Task<List<WorkerReview>> GetAllAsync(int? workerUserId = null, int? minRating = null, int? maxRating = null)
        {
            var query = _dbSet
                .Include(r => r.User)
                .Include(r => r.WorkerUser)
                .Include(r => r.ServiceRequest)
                .Where(r => !r.IsDeleted)
                .AsQueryable();

            if (workerUserId.HasValue && workerUserId.Value > 0)
            {
                query = query.Where(r => r.WorkerUserId == workerUserId.Value);
            }

            if (minRating.HasValue)
            {
                query = query.Where(r => r.Rating >= minRating.Value);
            }

            if (maxRating.HasValue)
            {
                query = query.Where(r => r.Rating <= maxRating.Value);
            }

            return await query.OrderByDescending(r => r.CreatedOn).ToListAsync();
        }
    }
}

