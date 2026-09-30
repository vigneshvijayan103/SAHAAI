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
    public class AdminUserController : ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminUserController(IAdminUserService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _service.GetAllUsersAsync();
            return Ok(new ApiResponse<List<AdminUserDto>>(200, "Users retrieved successfully", users));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetUserByIdAsync(id);
            if (user == null)
                return NotFound(new ApiResponse<string>(404, "User not found"));

            return Ok(new ApiResponse<AdminUserDto>(200, "User details retrieved", user));
        }

        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var currentUserIdClaim = User.FindFirst("userId")?.Value;
            if (int.TryParse(currentUserIdClaim, out int currentUserId) && currentUserId == id)
            {
                return BadRequest(new ApiResponse<string>(400, "You cannot deactivate your own admin account"));
            }

            var result = await _service.ToggleUserStatusAsync(id);
            if (!result)
                return NotFound(new ApiResponse<string>(404, "User not found"));

            return Ok(new ApiResponse<bool>(200, "User status toggled successfully", true));
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new ApiResponse<string>(400, "Search query is required"));

            var users = await _service.SearchUsersAsync(query);
            return Ok(new ApiResponse<List<AdminUserDto>>(200, "Search results", users));
        }
    }
}
