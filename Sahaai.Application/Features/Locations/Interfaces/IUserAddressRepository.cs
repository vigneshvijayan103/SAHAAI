using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Interfaces
{
    public interface IUserAddressRepository : IGenericRepository<UserAddress>
    {
        Task<List<UserAddress>> GetByUserIdAsync(int userId);
        Task<UserAddress?> GetDefaultAddressAsync(int userId);
        Task SoftDeleteAsync(int id, string role);
    }
}

