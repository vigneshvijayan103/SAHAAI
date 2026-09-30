using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class ServiceRepository : GenericRepository<Service>, IServiceRepository
    {
        public ServiceRepository(AppDbContext db) : base(db)
        {
        }

        public override async Task<Service?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, cancellationToken);
        }

        public override async Task<List<Service>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Where(x => !x.IsDeleted)
                .ToListAsync(cancellationToken);
        }
    }
}

