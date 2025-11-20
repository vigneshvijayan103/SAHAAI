using Sahaai.Application.Features.Users.DTO.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IForgotPasswordService
    {
        Task SendForgotPasswordOtpAsync(string email);
        Task<bool> VerifyOtpAndResetPasswordAsync(VerifyOtpAndResetDto dto);

    }
}
