using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext db) : base(db)
        {
        }

        public async Task<bool> ExistsAsync(string? email, string? username)
        {
            return await _dbSet
                .Include(u => u.Login)
                .AnyAsync(u =>
                    (!string.IsNullOrWhiteSpace(email) && u.Email == email) ||
                    (!string.IsNullOrWhiteSpace(username) && u.Login.Username == username)
                );
        }

        public async Task<Login> GetUserNameAsync(string UserName)
        {
            return await _db.Logins
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Username == UserName);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _dbSet
                .Include(u => u.Login)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> AddUserAsync(User user)
        {
            await AddAsync(user);
            await SaveChangesAsync();
            return user;
        }

        public async Task<bool> VerifyUserEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            var normalized = email.Trim().ToLower();

            var user = await _dbSet
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalized);

            if (user == null)
                return false;

            user.IsEmailVerified = true;
            user.EmailVerifiedAt = DateTime.Now;

            await SaveChangesAsync();
            return true;
        }

        public async Task UpdateLoginAsync(Login login)
        {
            _db.Logins.Update(login);
            await SaveChangesAsync();
        }
    }
}

