using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.UserProfile;
using Sahaai.Application.Features.Users.Interfaces;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _service;

        public UserProfileController(IUserProfileService service)
        {
            _service = service;
        }

        //Get user profile by userId
        [Authorize(Roles = "User")]
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {

            int userId = int.Parse(User.FindFirst("userId")!.Value);
            var profile = await _service.GetProfileAsync(userId);

            if (profile == null)
            {
                return NotFound(new ApiResponse<string>(
                    404,
                    "User profile not found"
                ));
            }

            return Ok(new ApiResponse<UserProfileDto>(
                200,
                "User profile retrieved successfully",
                profile
            ));
        }

        //update user profile
        [Authorize(Roles = "User")]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {

            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var updatedUser = await _service.UpdateProfileAsync(userId, dto);

            if (updatedUser == null)
            {
                return NotFound(new ApiResponse<string>(
                    404,
                    "User not found",
                    null
                ));
            }
            var responseDto = new UpdateUserProfileDto
            {
                FullName = updatedUser.FullName,
                PhoneNumber = updatedUser.Phone
            };


            return Ok(new ApiResponse<UpdateUserProfileDto>(
                200,
                "Profile updated successfully",
                responseDto
            ));
        }

        //update password
        [Authorize(Roles = "User")]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var result = await _service.ChangePasswordAsync(userId, dto);

            return Ok(new ApiResponse<bool>
            (
                200,
                "Password changed successfully",
                result
            ));
        }

    }
}
