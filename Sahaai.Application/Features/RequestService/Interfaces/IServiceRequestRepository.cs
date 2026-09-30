using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.Interfaces
{
    public interface IServiceRequestRepository : IGenericRepository<ServiceRequest>
    {
        Task<ServiceRequest?> GetByIdAndUserIdAsync(int requestId, int userId);
        Task<List<ServiceRequest>> GetByUserIdAsync(int userId);
        Task<ServiceRequest?> GetDetailsByIdAsync(int requestId);
    }
}

