using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class UserAddressRepository : GenericRepository<UserAddress>, IUserAddressRepository
    {
        public UserAddressRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<List<UserAddress>> GetByUserIdAsync(int userId)
        {
            return await _dbSet
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ToListAsync();
        }

        public async Task<UserAddress?> GetDefaultAddressAsync(int userId)
        {
            return await _dbSet
                .Where(a => a.UserId == userId && a.IsDefault)
                .FirstOrDefaultAsync();
        }

        public async Task SoftDeleteAsync(int id, string role)
        {
            var address = await GetByIdAsync(id);
            if (address != null)
            {
                address.IsDeleted = true;
                address.DeletedOn = DateTime.UtcNow;
                address.DeletedBy = role;
            }
        }
    }
}

