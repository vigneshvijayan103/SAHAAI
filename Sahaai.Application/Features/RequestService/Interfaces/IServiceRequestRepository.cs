using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.Interfaces
{
    public interface IServiceRequestRepository
    {
        Task<ServiceRequest> AddAsync(ServiceRequest request);
        Task<ServiceRequest?> GetByIdAndUserIdAsync(int requestId, int userId);
        Task UpdateAsync(ServiceRequest request);
        Task SaveChangesAsync();
        Task<List<ServiceRequest>> GetByUserIdAsync(int userId);
        Task<ServiceRequest?> GetDetailsByIdAsync(int requestId);
        Task<ServiceRequest?> GetByIdAsync(int id);
    }
}
