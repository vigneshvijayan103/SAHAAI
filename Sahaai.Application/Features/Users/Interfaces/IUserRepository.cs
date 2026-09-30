using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<bool> ExistsAsync(string? email, string? username);
        Task<Login> GetUserNameAsync(string UserName);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User> AddUserAsync(User user);
        Task<bool> VerifyUserEmailAsync(string email);
        Task UpdateLoginAsync(Login login);
    }
}

