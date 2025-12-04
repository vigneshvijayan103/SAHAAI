using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Interfaces
{
    public interface IUserAddressRepository
    {
        Task<UserAddress?> GetByIdAsync(int id);
        Task<List<UserAddress>> GetByUserIdAsync(int userId);
        Task<UserAddress?> GetDefaultAddressAsync(int userId);
        Task AddAsync(UserAddress address);
        Task UpdateAsync(UserAddress address);
        Task SoftDeleteAsync(int id, string role);
        Task SaveChangesAsync();

    }
}
