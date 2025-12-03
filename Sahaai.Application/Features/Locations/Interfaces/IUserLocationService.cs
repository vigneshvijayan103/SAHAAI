using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Interfaces
{
    public interface IUserLocationService
    {
        Task<string> UpdateUserLocationAsync(int userId, string role, UpdateLocationDto dto);
        Task<LocationResponseDto?> GetLatestLocationAsync(int userId);
        Task<List<LocationResponseDto>> GetLocationHistoryAsync(int userId);
       
    }
}
