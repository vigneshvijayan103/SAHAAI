using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using Sprache;
using System.Security.Claims;

namespace Sahaai.Api.Controllers
{
   
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles ="User")]
    public class UserLocationController : ControllerBase
    {
        private readonly IUserAddressService _locationService;
        public UserLocationController(IUserAddressService locationService)
        {
            _locationService = locationService;
        }

        //get all addresses
        [HttpGet()]
        public async Task<IActionResult> GetAll()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetAddressesAsync(userId);

            if (response == null)
                return NotFound(new ApiResponse<string>(404, "No Addresses found"));

            return Ok(new ApiResponse<List<AddressResponseDto>>(200, "Address Fetched Successfully", response));
        }

        //Get Address By Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAddressById(int id)
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetAddressByIdAsync(id, userId);

            if (response == null)
                return NotFound(new ApiResponse<string>(404, "No location found"));

            return Ok(new ApiResponse<AddressResponseDto>(200, "Location Fetched Successfully", response));
        }

        //get default address

        [HttpGet("default")]

        public async Task<IActionResult> GetDefaultAddress()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var response = await _locationService.GetDefaultAddressAsync(userId);

            if (response == null)
                return NotFound(new ApiResponse<string>(404, "No default address found"));

            return Ok(new ApiResponse<AddressResponseDto>(200, "Default Address Fetched Successfully", response));
        }



        //Add new address
        [HttpPost("Address")]
        public async Task<IActionResult> AddAddress([FromBody] AddAddressDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid payload");

            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var role = User.FindFirst("role")?.Value
                          ?? User.FindFirst(ClaimTypes.Role)?.Value;

            var result = await _locationService.AddAddressAsync(userId,role, dto);

            return Ok(new ApiResponse<AddressResponseDto>(200, "Address added Successfully",result));
        }

        //update address
        [HttpPut("{id}")]

        public async Task<IActionResult> UpdateAddress(int id ,[FromBody] UpdateAddressDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid payload");

            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var role = User.FindFirst("role")?.Value
                        ?? User.FindFirst(ClaimTypes.Role)?.Value;


            var result = await _locationService.UpdateAddressAsync(id, userId, role, dto);

            if (result == null)
                return NotFound(new ApiResponse<string>(404, "Address not found"));

            return Ok(new ApiResponse<AddressResponseDto>(200, "Address updated Successfully", result));
        }

        //delete address
        [HttpDelete("{id}")]

        public async Task<IActionResult>SoftdeleteAddress(int id)
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var role = User.FindFirst("role")?.Value
                       ?? User.FindFirst(ClaimTypes.Role)?.Value;

            var result = await _locationService.DeleteAddressAsync(id,role, userId);

            if (!result)
                return NotFound(new ApiResponse<string>(404, "Address not found"));

            return Ok(new ApiResponse<bool>(200, "Address deleted Successfully",true));
        }







    }
}
