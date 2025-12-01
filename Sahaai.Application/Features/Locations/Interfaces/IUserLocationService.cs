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
        Task<ApiResponse<string>> UpdateUserLocationAsync(int userId, UpdateLocationDto dto);
        Task<ApiResponse<LocationResponseDto>> GetLatestLocationAsync(int userId);
        Task<ApiResponse<List<LocationResponseDto>>> GetLocationHistoryAsync(int userId);
        Task<ApiResponse<List<object>>> GetNearbyWorkersAsync(double latitude, double longitude, double radius);
    }
}
