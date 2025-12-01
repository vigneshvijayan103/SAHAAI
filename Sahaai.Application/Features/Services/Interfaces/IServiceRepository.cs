using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Services.Interfaces
{
    public interface IServiceRepository
    {
        Task AddAsync(Service service);
        Task<Service?> GetByIdAsync(int id);
        Task<List<Service>> GetAllAsync();
        Task UpdateAsync(Service service);
        Task SaveChangesAsync();

    }
}
