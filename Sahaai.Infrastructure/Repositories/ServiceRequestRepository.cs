using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class ServiceRequestRepository : GenericRepository<ServiceRequest>, IServiceRequestRepository
    {
        public ServiceRequestRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<ServiceRequest?> GetByIdAndUserIdAsync(int requestId, int userId)
        {
            return await _dbSet
                .Where(r => r.UserId == userId)
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }

        public override async Task<ServiceRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(u => u.User)
                .Include(a => a.Address)
                .Include(s => s.Service)
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<List<ServiceRequest>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();
        }

        public async Task<ServiceRequest?> GetDetailsByIdAsync(int requestId)
        {
            return await _dbSet
                .Include(r => r.Address)
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }
    }
}

