using Sahaai.Application.Common;
using Sahaai.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Workers.Interfaces
{
    public interface IWorkerRepository : IGenericRepository<WorkerDetails>
    {
        Task<WorkerDetails?> GetByUserIdAsync(int userId);
        Task<WorkerDetails?> GetByAadhaarAsync(string aadhaar);
        Task AddWorkerDetailsAsync(WorkerDetails details);
        Task UpdateWorkerDetailsAsync(WorkerDetails details);
    }
}

