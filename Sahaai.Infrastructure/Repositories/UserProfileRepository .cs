using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Users.DTO.UserProfile;
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
    public class UserProfileRepository:IUserProfileRepository

    {
        private readonly AppDbContext _db;

        public UserProfileRepository(AppDbContext db)
        {
            _db = db;
        }

        //Get user profile by userId
        public async Task<User?> GetProfileAsync(int userId)
        {
            return await _db.Users
              .Include(u => u.Login)
              .FirstOrDefaultAsync(x => x.Id == userId);

        }

        //update user
        public async Task UpdateUserAsync(User user)
        {
            _db.Users.Update(user);
            await  _db.SaveChangesAsync();
        }


    }
}
