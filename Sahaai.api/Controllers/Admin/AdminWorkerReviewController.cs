using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Reviews.DTO;
using Sahaai.Application.Features.Reviews.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sahaai.Api.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminWorkerReviewController : ControllerBase
    {
        private readonly IWorkerReviewService _reviewService;

        public AdminWorkerReviewController(IWorkerReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReviews([FromQuery] int? workerUserId, [FromQuery] int? minRating, [FromQuery] int? maxRating)
        {
            var reviews = await _reviewService.GetAllReviewsForAdminAsync(workerUserId, minRating, maxRating);
            return Ok(new ApiResponse<List<WorkerReviewDto>>(200, "Worker reviews retrieved successfully", reviews));
        }

        [HttpGet("summaries")]
        public async Task<IActionResult> GetWorkerSummaries()
        {
            var summaries = await _reviewService.GetWorkerRatingSummariesAsync();
            return Ok(new ApiResponse<List<WorkerRatingSummaryDto>>(200, "Worker rating summaries retrieved successfully", summaries));
        }

        [HttpGet("worker/{workerUserId}")]
        public async Task<IActionResult> GetWorkerSummary(int workerUserId)
        {
            var summary = await _reviewService.GetWorkerRatingSummaryAsync(workerUserId);
            if (summary == null)
            {
                return NotFound(new ApiResponse<string>(404, "No ratings found for this worker"));
            }
            return Ok(new ApiResponse<WorkerRatingSummaryDto>(200, "Worker summary retrieved successfully", summary));
        }
    }
}

