using Sahaai.Application.Features.Admin.DTO;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Admin.Interfaces
{
    public interface IAdminDashboardService
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}

