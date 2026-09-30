using Sahaai.Application.Features.Admin.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Admin.Interfaces
{
    public interface IAdminUserService
    {
        Task<List<AdminUserDto>> GetAllUsersAsync();
        Task<AdminUserDto?> GetUserByIdAsync(int id);
        Task<bool> ToggleUserStatusAsync(int id);
        Task<List<AdminUserDto>> SearchUsersAsync(string query);
    }
}

