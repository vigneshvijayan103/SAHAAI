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
    public class AdminServiceRequestController : ControllerBase
    {
        private readonly IAdminServiceRequestService _service;

        public AdminServiceRequestController(IAdminServiceRequestService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var requests = await _service.GetAllRequestsAsync();
            return Ok(new ApiResponse<List<AdminServiceRequestDto>>(200, "Service requests retrieved", requests));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var request = await _service.GetRequestByIdAsync(id);
            if (request == null)
                return NotFound(new ApiResponse<string>(404, "Service request not found"));

            return Ok(new ApiResponse<AdminServiceRequestDto>(200, "Request details retrieved", request));
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRequestStatusDto dto)
        {
            var result = await _service.UpdateRequestStatusAsync(id, dto.Status);
            if (!result)
                return BadRequest(new ApiResponse<string>(400, "Failed to update status. Invalid status or request not found."));

            return Ok(new ApiResponse<bool>(200, "Request status updated successfully", true));
        }

        [HttpDelete("{id}/cancel")]
        public async Task<IActionResult> AdminCancel(int id, [FromBody] CancelReasonDto? dto)
        {
            var result = await _service.AdminCancelRequestAsync(id, dto?.Reason);
            if (!result)
                return BadRequest(new ApiResponse<string>(400, "Cannot cancel. Request may already be completed or not found."));

            return Ok(new ApiResponse<bool>(200, "Request cancelled by admin", true));
        }
    }

    public class CancelReasonDto
    {
        public string? Reason { get; set; }
    }
}
