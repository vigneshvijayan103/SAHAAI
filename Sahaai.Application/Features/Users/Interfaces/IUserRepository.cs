using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserRepository
    {
        Task<bool> ExistsAsync(string? email, string? username);

        Task<Login> GetUserNameAsync(string UserName);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> AddUserAsync(User user); 

        Task VerifyUserEmailAsync(string email);
        Task UpdateLoginAsync(Login login);



    }
}
