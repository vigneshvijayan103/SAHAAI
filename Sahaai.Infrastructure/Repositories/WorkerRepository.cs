using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Workers.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System.Threading;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class WorkerRepository : GenericRepository<WorkerDetails>, IWorkerRepository
    {
        public WorkerRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<WorkerDetails?> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Include(w => w.User)
                    .ThenInclude(u => u.Login)
                .FirstOrDefaultAsync(w => w.UserId == userId && !w.IsDeleted);
        }

        public override async Task<WorkerDetails?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(w => w.User)
                    .ThenInclude(u => u.Login)
                .FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);
        }

        public async Task<WorkerDetails?> GetByAadhaarAsync(string aadhaar)
        {
            return await _dbSet
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.AadhaarNumber == aadhaar && !w.IsDeleted);
        }

        public async Task AddWorkerDetailsAsync(WorkerDetails details)
        {
            await AddAsync(details);
        }

        public Task UpdateWorkerDetailsAsync(WorkerDetails details)
        {
            Update(details);
            return Task.CompletedTask;
        }
    }
}

