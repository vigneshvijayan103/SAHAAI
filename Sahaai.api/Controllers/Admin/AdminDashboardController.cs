using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Admin.DTO;
using Sahaai.Application.Features.Admin.Interfaces;

namespace Sahaai.Api.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardService _service;

        public AdminDashboardController(IAdminDashboardService service)
        {
            _service = service;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _service.GetDashboardStatsAsync();
            return Ok(new ApiResponse<DashboardStatsDto>(200, "Dashboard stats retrieved successfully", stats));
        }
    }
}
