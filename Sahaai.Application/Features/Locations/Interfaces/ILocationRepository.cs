using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Interfaces
{
    public interface ILocationRepository
    {
        Task<UserLocation?> GetLatestLocationAsync(int userId);
        Task AddOrUpdateLatestLocationAsync(UserLocation location);
        Task AddLocationHistoryAsync(UserLocationHistory history);
        Task<List<UserLocationHistory>> GetLocationHistoryAsync(int userId);
        Task<List<UserLocation>> GetAllWorkerLocationsAsync();
    }
}
