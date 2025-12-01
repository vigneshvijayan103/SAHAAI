using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Infrastructure.Services;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthController : ControllerBase
    {
        private readonly IUserAuthService _userAuthService;
        private readonly IForgotPasswordService _forgotPasswordService;

        public UserAuthController(IUserAuthService userAuthService, IForgotPasswordService forgotPasswordService)
        {
            _userAuthService = userAuthService;
            _forgotPasswordService = forgotPasswordService;
        }

        //Register user
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto dto)
        {
            var result = await _userAuthService.RegisterUserAsync(dto);


            if (result.UserId == 0)
            {
                return BadRequest(new ApiResponse<object>(
                    400,
                    result.Message,
                    null
                ));
            }


            return Ok(new ApiResponse<object>(
                        200,
                        result.Message,
                        new { userId = result.UserId }
                    ));
        }

        //verify-otp

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            if (dto.Id <= 0 || string.IsNullOrWhiteSpace(dto.Otp))
            {
                return BadRequest(new ApiResponse<string>(
                    400,
                    "UserId and OTP are required"
                ));
            }

            var result = await _userAuthService.VerifyOtpAsync(dto.Id, dto.Otp);

            if (!result.Success)
            {
                return BadRequest(new ApiResponse<string>(
                    result.StatusCode,
                    result.Message
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

            var response = await _userAuthService.LoginAsync(dto);

            return Ok(new ApiResponse<LoginResponseDto>(
                200,
                "Login successful",
                response
            ));

        }

        //forgot-password
        [HttpPost("forgot/send-otp")]
        public async Task<IActionResult> SendForgotPasswordOtp([FromBody] ForgotPasswordRequestDto dto)
        {
            await _forgotPasswordService.SendForgotPasswordOtpAsync(dto.Email);

            var response = new ApiResponse<string>(
                200,
                "OTP has been sent to your email for password reset.",
                null
            );

            return Ok(response);
        }

        //verify-otp-and-reset-password

        [HttpPost("forgot/reset-password")]
        public async Task<IActionResult> ResetPasswordUsingOtp([FromBody] VerifyOtpAndResetDto dto)
        {
            bool success = await _forgotPasswordService.VerifyOtpAndResetPasswordAsync(dto);

            if (!success)
            {
                var errorResponse = new ApiResponse<string>(
                    400,
                    "Invalid or expired OTP.",
                    null
                );

                return BadRequest(errorResponse);
            }

            var response = new ApiResponse<string>(
                200,
                "Password has been reset successfully.",
                null
            );

            return Ok(response);
        }








    }
}

