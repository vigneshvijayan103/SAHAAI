using Dapper;
using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class UserRepository:IUserRepository
    {
        private readonly AppDbContext _db;
       
     

        public UserRepository(AppDbContext db)
        {
            _db = db;
           
            
        }


        //Check if user exists by email or username
        public async Task<bool> ExistsAsync(string? email, string? username)
        {
            return await _db.Users
                .Include(u => u.Login)
                .AnyAsync(u =>
                    (!string.IsNullOrWhiteSpace(email) && u.Email == email) ||
                    (!string.IsNullOrWhiteSpace(username) && u.Login.Username == username)
                );
        }


        //get user by Name
        public async Task<Login> GetUserNameAsync(string UserName)
        {
            return await _db.Logins
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Username == UserName);
        }


        //get user by Email
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _db.Users
                .Include(u => u.Login)   
                .FirstOrDefaultAsync(u => u.Email == email);
        }



        //Register User
        public async  Task<User> AddUserAsync(User user)
        {
            await _db.Users.AddAsync(user);

            await _db.SaveChangesAsync(); 

            return user;
        }

        //Verify User Email
        public async Task VerifyUserEmailAsync(string email)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
                return;

            user.IsEmailVerified = true;
            user.EmailVerifiedAt = DateTime.Now;
            user.ModifiedOn = DateTime.Now;
            user.ModifiedBy = "User";

            await _db.SaveChangesAsync();
        }

        //update db after Login
        public async Task UpdateLoginAsync(Login login)
        {
            _db.Logins.Update(login);
            await _db.SaveChangesAsync();
        }













    }
}
