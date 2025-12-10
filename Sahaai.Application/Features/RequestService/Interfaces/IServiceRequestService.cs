using Sahaai.Application.Features.RequestService.DTO;
using Sahaai.Application.Features.Users.RequesrService.DTO;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.Interfaces
{
    public interface IServiceRequestService
    {
        Task<ServiceRequest> RaiseRequestAsync(int UserId, string role, ServiceRequestCreateDto dto);
        Task<bool> CancelRequestAsync(int requestId, string role, int UserId, CancelRequestDto dto);
        Task<ServiceRequestStatusDto?> GetStatusDtoAsync(int requestId, int userId);
        Task<List<ServiceRequestHistoryDto>> GetHistoryAsync(int userId);
        Task<ServiceRequestDetailsDto?> GetDetailsAsync(int requestId);
    }
}
