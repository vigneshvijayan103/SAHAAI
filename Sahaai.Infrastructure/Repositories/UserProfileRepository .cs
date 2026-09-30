using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class UserProfileRepository : GenericRepository<User>, IUserProfileRepository
    {
        public UserProfileRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<User?> GetProfileAsync(int userId)
        {
            return await _dbSet
              .Include(u => u.Login)
              .FirstOrDefaultAsync(x => x.Id == userId);
        }

        public async Task UpdateUserAsync(User user)
        {
            Update(user);
            await SaveChangesAsync();
        }
    }
}

