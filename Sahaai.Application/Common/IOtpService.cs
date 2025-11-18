using Sahaai.Application.Features.Users.DTO.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Common
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(string email, string purpose);


        Task<bool> VerifyOtpAsync(string email, string purpose, string otp);
    }
}
