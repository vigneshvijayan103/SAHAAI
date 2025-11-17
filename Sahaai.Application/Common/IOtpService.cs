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
        Task<string> GenerateOtpAsync(string key);

       
        Task<bool> VerifyOtpAsync(string key, string otp);
    }
}
