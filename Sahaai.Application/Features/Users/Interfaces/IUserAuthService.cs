using Sahaai.Application.Features.Users.DTO.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserAuthService
    {
        Task<RegisterResponseDto> RegisterUserAsync(UserRegisterDto dto);
        Task ResendOtpAsync(string email);
        Task<OtpVerifyResult> VerifyOtpAsync(int userId, string otp);
        Task<LoginResponseDto> LoginAsync(UserLoginDto dto);



    }
   
}
