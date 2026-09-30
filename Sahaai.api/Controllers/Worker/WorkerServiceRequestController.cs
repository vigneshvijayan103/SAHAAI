using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Application.Features.Workers.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Api.Controllers.Worker
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Worker")]
    public class WorkerServiceRequestController : ControllerBase
    {
        private readonly IWorkerService _workerService;

        public WorkerServiceRequestController(IWorkerService workerService)
        {
            _workerService = workerService;
        }

        private int GetCurrentWorkerUserId()
        {
            return int.Parse(User.FindFirst("userId")!.Value);
        }

        // GET: api/WorkerServiceRequest/available?lat=12.97&lng=77.59&radius=15
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRequests(
            [FromQuery] double? lat = null,
            [FromQuery] double? lng = null,
            [FromQuery] double? radius = null)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var jobs = await _workerService.GetAvailableJobsAsync(workerUserId, lat, lng, radius);
            return Ok(new ApiResponse<List<WorkerJobDto>>(200, "Available dispatch requests retrieved successfully", jobs));
        }

        // GET: api/WorkerServiceRequest/current
        [HttpGet("current")]
        public async Task<IActionResult> GetCurrentActiveJob()
        {
            int workerUserId = GetCurrentWorkerUserId();
            var job = await _workerService.GetCurrentJobAsync(workerUserId);
            if (job == null)
            {
                return Ok(new ApiResponse<object?>(200, "No active job currently assigned", null));
            }

            return Ok(new ApiResponse<WorkerJobDto>(200, "Active job retrieved successfully", job));
        }

        // GET: api/WorkerServiceRequest/history
        [HttpGet("history")]
        public async Task<IActionResult> GetJobHistory()
        {
            int workerUserId = GetCurrentWorkerUserId();
            var history = await _workerService.GetJobHistoryAsync(workerUserId);
            return Ok(new ApiResponse<List<WorkerJobDto>>(200, "Job history retrieved successfully", history));
        }

        // GET: api/WorkerServiceRequest/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetJobDetails(int id)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var job = await _workerService.GetJobDetailsAsync(workerUserId, id);
            if (job == null)
            {
                return NotFound(new ApiResponse<object?>(404, "Service request not found or not accessible", null));
            }

            return Ok(new ApiResponse<WorkerJobDto>(200, "Job details retrieved successfully", job));
        }

        // POST: api/WorkerServiceRequest/{id}/accept
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptJob(int id)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var success = await _workerService.AcceptJobAsync(workerUserId, id);
            if (!success)
            {
                return BadRequest(new ApiResponse<object?>(400, "Unable to accept request. You may already have an active job in progress (cannot take two jobs at the same time), or the request is no longer available.", null));
            }

            return Ok(new ApiResponse<object>(200, "Service request accepted successfully.", new { requestId = id, status = "Accepted" }));
        }

        // PUT: api/WorkerServiceRequest/{id}/start?lat=12.97&lng=77.59
        [HttpPut("{id}/start")]
        public async Task<IActionResult> StartJob(int id, [FromQuery] double? lat = null, [FromQuery] double? lng = null)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var (success, message) = await _workerService.StartJobAsync(workerUserId, id, lat, lng);
            if (!success)
            {
                return BadRequest(new ApiResponse<object?>(400, message, null));
            }

            return Ok(new ApiResponse<object>(200, message, new { requestId = id, status = "InProgress" }));
        }

        // PUT: api/WorkerServiceRequest/{id}/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteJob(int id, [FromBody] CompleteJobDto? dto)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var success = await _workerService.CompleteJobAsync(workerUserId, id, dto?.Notes);
            if (!success)
            {
                return BadRequest(new ApiResponse<object?>(400, "Unable to complete job. Request must be InProgress.", null));
            }

            return Ok(new ApiResponse<object>(200, "Service request completed successfully.", new { requestId = id, status = "Completed" }));
        }

        // POST: api/WorkerServiceRequest/{id}/reject
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectJob(int id, [FromBody] RejectJobDto? dto)
        {
            int workerUserId = GetCurrentWorkerUserId();
            var success = await _workerService.RejectJobAsync(workerUserId, id, dto?.Reason);
            if (!success)
            {
                return BadRequest(new ApiResponse<object?>(400, "Unable to reject request.", null));
            }

            return Ok(new ApiResponse<object>(200, "Request declined/released.", new { requestId = id }));
        }
    }
}

