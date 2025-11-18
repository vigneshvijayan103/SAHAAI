using Sahaai.Application.Features.Users.DTO.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Common
{
    public interface IMailkitService
    {
        Task SendOtpEmailAsync(string toEmail, string otp, string purpose);


    }
}
