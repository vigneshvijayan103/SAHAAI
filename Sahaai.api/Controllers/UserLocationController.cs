using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using Sprache;
using System.Security.Claims;

namespace Sahaai.Api.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="User")]
    public class UserLocationController : ControllerBase
    {
        private readonly IUserLocationService _locationService;
        public UserLocationController(IUserLocationService locationService)
        {
            _locationService = locationService;
        }

        //update and add new location
        [HttpPost("update")]
        public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid payload");

            int userId = int.Parse(User.FindFirst("userId")!.Value);
            string role = User.FindFirst("role")!.Value;

            var result = await _locationService.UpdateUserLocationAsync(userId, role, dto);

            return Ok(new ApiResponse<string>(200, result));
        }


        //get latest location
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestLocation()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetLatestLocationAsync(userId);

            if (response == null)
                return NotFound(new ApiResponse<LocationResponseDto>(404, "No location found"));

            return Ok(new ApiResponse<LocationResponseDto>(200, "Success", response));
        }

        // Get All locations 
        [HttpGet("history")]
        public async Task<IActionResult> GetLocationHistory()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetLocationHistoryAsync(userId);

            return Ok(new ApiResponse<List<LocationResponseDto>>(200, "Success", response));
        }



    }
}
