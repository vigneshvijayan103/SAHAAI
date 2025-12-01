using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using System.Security.Claims;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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

            var response = await _locationService.UpdateUserLocationAsync(userId, dto);

            return StatusCode(response.StatusCode, response);
        }

        //get latest location
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestLocation()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);


            var response = await _locationService.GetLatestLocationAsync(userId);

            return StatusCode(response.StatusCode, response);
        }

        // Get All locations 
        [HttpGet("history")]
        public async Task<IActionResult> GetLocationHistory()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetLocationHistoryAsync(userId);

            return StatusCode(response.StatusCode, response);
        }

       





    }
}
