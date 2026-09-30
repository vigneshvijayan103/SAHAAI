using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Application.Features.Workers.Interfaces;
using System.Threading.Tasks;

namespace Sahaai.Api.Controllers.Worker
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Worker")]
    public class WorkerProfileController : ControllerBase
    {
        private readonly IWorkerService _workerService;

        public WorkerProfileController(IWorkerService workerService)
        {
            _workerService = workerService;
        }

        private int GetCurrentWorkerUserId()
        {
            return int.Parse(User.FindFirst("userId")!.Value);
        }

        // GET: api/WorkerProfile
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            int workerUserId = GetCurrentWorkerUserId();
            var profile = await _workerService.GetProfileAsync(workerUserId);
            if (profile == null)
            {
                return NotFound(new ApiResponse<object?>(404, "Worker profile not found", null));
            }

            return Ok(new ApiResponse<WorkerProfileDto>(200, "Worker profile retrieved successfully", profile));
        }

        // PUT: api/WorkerProfile
        [HttpPut]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateProfile([FromForm] WorkerUpdateProfileDto dto)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var profile = await _workerService.UpdateProfileAsync(workerUserId, dto);
            if (profile == null)
            {
                return NotFound(new ApiResponse<object?>(404, "Worker profile not found", null));
            }

            return Ok(new ApiResponse<WorkerProfileDto>(200, "Worker profile updated successfully", profile));
        }

        // PUT: api/WorkerProfile/availability
        [HttpPut("availability")]
        public async Task<IActionResult> UpdateAvailability([FromBody] WorkerAvailabilityDto dto)
        {
            int workerUserId = GetCurrentWorkerUserId();
            string targetStatus = !string.IsNullOrWhiteSpace(dto.Status)
                ? dto.Status
                : (dto.IsOnline ? "Online" : "Offline");

            var success = await _workerService.UpdateAvailabilityStatusAsync(workerUserId, targetStatus);
            if (!success)
            {
                return BadRequest(new ApiResponse<object?>(400, "Worker is currently OnDuty with an active job and cannot change status manually.", null));
            }

            var currentStatus = await _workerService.GetWorkerStatusAsync(workerUserId);
            bool isOnline = currentStatus != "Offline";
            return Ok(new ApiResponse<object>(200, $"Worker status updated to {currentStatus}", new { status = currentStatus, isOnline }));
        }

        // POST: api/WorkerProfile/location
        [HttpPost("location")]
        public async Task<IActionResult> UpdateLocation([FromBody] WorkerLocationUpdateDto dto)
        {
            int workerUserId = GetCurrentWorkerUserId();
            await _workerService.UpdateLocationAsync(workerUserId, dto.Latitude, dto.Longitude);
            return Ok(new ApiResponse<object>(200, "Worker location updated successfully", new { latitude = dto.Latitude, longitude = dto.Longitude }));
        }

        // GET: api/WorkerProfile/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            int workerUserId = GetCurrentWorkerUserId();
            var stats = await _workerService.GetDashboardStatsAsync(workerUserId);
            return Ok(new ApiResponse<WorkerDashboardStatsDto>(200, "Dashboard stats retrieved successfully", stats));
        }
    }
}

