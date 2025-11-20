using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Users.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace Sahaai.Application.Features.Users.Services
{
    public class ForgotPasswordService:IForgotPasswordService
    {
        private readonly IUserRepository _repo;
        private readonly IOtpService _otpService;
        private readonly IMailkitService _mailkitService;
        private readonly IAuthService _authService;

        public ForgotPasswordService(IUserRepository repo,
                                     IOtpService otpService,
                                    IMailkitService mailkitService,
                                    IAuthService authService  
                                    )
        {
            _repo = repo;
            _otpService = otpService;
            _mailkitService = mailkitService;
            _authService = authService;
        }

        public async Task SendForgotPasswordOtpAsync(string email)
        {

            var user = await _repo.ExistsAsync(email,null);
            if (!user)
                throw new KeyNotFoundException("No user found with this email.");

            var otp = await _otpService.GenerateOtpAsync(email, "forgot");

            await _mailkitService.SendOtpEmailAsync(email, otp, "forgot");

        }

        public async Task<bool> VerifyOtpAndResetPasswordAsync(VerifyOtpAndResetDto dto)
        {
           
            if (!await _otpService.VerifyOtpAsync(dto.Email, "forgot", dto.Otp))
                return false;

          
            var user = await _repo.GetUserByEmailAsync(dto.Email)
                ?? throw new KeyNotFoundException("No user found with this email.");

            
            _authService.CreatePasswordHash(dto.NewPassword, out byte[] hash, out byte[] salt);

          
            user.Login.PasswordHash = Convert.ToBase64String(hash);
            user.Login.PasswordSalt = Convert.ToBase64String(salt);

          
            await _repo.UpdateLoginAsync(user.Login);

            return true;
        }

    }
}
