using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserProfileRepository : IGenericRepository<User>
    {
        Task<User?> GetProfileAsync(int userId);
        Task UpdateUserAsync(User user);
    }
}

