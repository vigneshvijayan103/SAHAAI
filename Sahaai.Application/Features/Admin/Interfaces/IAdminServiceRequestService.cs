using Sahaai.Application.Features.Admin.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Admin.Interfaces
{
    public interface IAdminServiceRequestService
    {
        Task<List<AdminServiceRequestDto>> GetAllRequestsAsync();
        Task<AdminServiceRequestDto?> GetRequestByIdAsync(int id);
        Task<bool> UpdateRequestStatusAsync(int id, string status);
        Task<bool> AdminCancelRequestAsync(int id, string? reason);
    }
}

