using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Reviews.DTO;
using Sahaai.Application.Features.Reviews.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerReviewController : ControllerBase
    {
        private readonly IWorkerReviewService _reviewService;

        public WorkerReviewController(IWorkerReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private int GetCurrentUserId()
        {
            var claimValue = User.FindFirst("userId")?.Value
                             ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(claimValue, out var id))
            {
                return id;
            }
            return 0;
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CreateReview([FromBody] CreateWorkerReviewDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized(new ApiResponse<string>(401, "Invalid user credentials"));
            }

            try
            {
                var result = await _reviewService.CreateReviewAsync(userId, dto);
                return Ok(new ApiResponse<WorkerReviewDto>(200, "Review submitted successfully", result));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<string>(400, ex.Message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new ApiResponse<string>(404, ex.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ApiResponse<string>(403, ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<string>(400, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>(500, $"An error occurred while submitting review: {ex.Message}"));
            }
        }

        [HttpGet("request/{requestId}")]
        [Authorize(Roles = "User,Admin")]
        public async Task<IActionResult> GetReviewByRequestId(int requestId)
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            try
            {
                // If admin, we can still fetch or pass admin bypass
                var review = await _reviewService.GetReviewByRequestIdAsync(requestId, userId);
                if (review == null)
                {
                    return NotFound(new ApiResponse<string>(404, "No review found for this service request"));
                }
                return Ok(new ApiResponse<WorkerReviewDto>(200, "Review retrieved successfully", review));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new ApiResponse<string>(403, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<string>(500, ex.Message));
            }
        }

        [HttpGet("worker/{workerUserId}/summary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWorkerSummary(int workerUserId)
        {
            var summary = await _reviewService.GetWorkerRatingSummaryAsync(workerUserId);
            if (summary == null)
            {
                return NotFound(new ApiResponse<string>(404, "No ratings found for this worker"));
            }
            return Ok(new ApiResponse<WorkerRatingSummaryDto>(200, "Worker rating summary retrieved", summary));
        }
    }
}

