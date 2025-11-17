using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Users.Services;
using Sahaai.Infrastructure.Services;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthController : ControllerBase
    {
        private readonly UserAuthService _userAuthService;

        public UserAuthController(UserAuthService userAuthService)
        {
            _userAuthService = userAuthService;
        }

        //Register user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            var result = await _userAuthService.RegisterUserAsync(dto);


            if (result == "Email already exists" || result == "Username already exists")
            {
                return BadRequest(new ApiResponse<string>(
                    400,
                    result,
                    null
                ));
            }


            return Ok(new ApiResponse<string>(
                200,
                result,
                null
            ));
        }

        //verify-otp

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Otp))
            {
                return BadRequest(new ApiResponse<string>(
                    400,
                    "Email and OTP are required"
                ));
            }


            var result = await _userAuthService.VerifyOtpAsync(dto.Email, dto.Otp);

            if (!result)
            {
                return BadRequest(new ApiResponse<string>(
                    400,
                    "Invalid or expired OTP"
                ));
            }

            return Ok(new ApiResponse<string>(
                200,
                "Email verified successfully"
            ));
        }



        //resend-otp
        [HttpPost("resend-otp")]
        [EnableRateLimiting("ResendOtpLimit")]
        public async Task<IActionResult> ResendUserOtp([FromBody] ResendOtpRequestDto dto)
        {
            await _userAuthService.ResendOtpAsync(dto.Email);

            return Ok(new ApiResponse<string>(
                200,
                "OTP resent successfully",
                null
            ));

        }



        //Login user

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {

            var token = await _userAuthService.LoginAsync(dto);

            return Ok(new ApiResponse<string>(200, "Login successful", token));

        }


        [Authorize]
        [HttpGet("Authorize")]

        public async Task<IActionResult> MockApi()
        {

             return Ok("Token success");
        }



        [Authorize(Roles ="User")]
        [HttpGet("auth")]

        public async Task<IActionResult> UserAuth()
        {

            return Ok("Token success for user");
        }






    }
}

