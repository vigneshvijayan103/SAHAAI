using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Features.Users.Services;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.UserProfile;
using Microsoft.AspNetCore.Authorization;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserProfileController : ControllerBase
    {
        private readonly UserProfileService _service;

        public UserProfileController(UserProfileService service)
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


    }
}
