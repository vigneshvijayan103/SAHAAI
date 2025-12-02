using Sahaai.Application.Features.Services.DTO;
using Sahaai.Application.Features.Services.DTO.ServiceManage;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Services.Interfaces
{
    public interface IServiceManager
    {
        Task<ServiceResponseDto> CreateAsync(CreateServiceDto dto);
        Task<ServiceResponseDto?> UpdateAsync(int id, UpdateServiceDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<ServiceResponseDto>> GetAllAsync();
        Task<ServiceResponseDto?> GetByIdAsync(int id);
    }
}
