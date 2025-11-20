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
        Task<String> RegisterUserAsync(UserRegisterDto dto);
        Task ResendOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
        Task<string> LoginAsync(UserLoginDto dto);



    }
   
}
