using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;



namespace Sahaai.Application.Features.Users.Services
{
    public class UserAuthService:IUserAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IAuthService _auth;
        private readonly IMapper _mapper;
        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;
        private readonly IMailkitService _mailkitService;

        public UserAuthService(IUserRepository repo,
                                IAuthService auth,
                                IMapper mapper,
                                IAuthService authService,
                                IOtpService otpService,
                                IMailkitService mailkitService)

        {
            _repo = repo;
            _auth = auth;
            _mapper = mapper;
            _authService = authService;
            _otpService = otpService;
            _mailkitService = mailkitService;
        }



        //Register User 
        public async Task<String> RegisterUserAsync(UserRegisterDto dto)
        {

            if (await _repo.ExistsAsync(dto.Email, null))
                return "Email already exists";


            if (await _repo.ExistsAsync(null, dto.Username))
                return "Username already exists";

            _auth.CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);


            var user = _mapper.Map<User>(dto);
            user.Role = UserRole.User;
            user.IsActive = true;
            user.CreatedBy = "User";
            user.CreatedOn = DateTime.Now;


            user.Login = new Login
            {
                Username = dto.Username,
                PasswordHash = Convert.ToBase64String(hash),
                PasswordSalt = Convert.ToBase64String(salt)

            };
            await _repo.AddUserAsync(user);

            //otp generation 
            var otp = await _otpService.GenerateOtpAsync(dto.Email, "register");


            //send otp to email
            await _mailkitService.SendOtpEmailAsync(dto.Email, otp, "register");

            return "Registered successfully. OTP sent to your email";

        }

        //resend otp
        public async Task ResendOtpAsync(string email)
        {

            var user = await _repo.ExistsAsync(email, null);

            if (!user)
                throw new KeyNotFoundException("Email not found");

            var otp = await _otpService.GenerateOtpAsync(email, "register");

            await _mailkitService.SendOtpEmailAsync(email, otp, "register");
        }



        //verify otp

        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            var isValid = await _otpService.VerifyOtpAsync(email, "register", otp);
            if (!isValid)
                return false;


            await _repo.VerifyUserEmailAsync(email);



            return true;
        }

        //login user
        public async Task<string> LoginAsync(UserLoginDto dto)
        {
            var user = await _repo.GetUserNameAsync(dto.UserName);


            if (user == null)
                throw new UnauthorizedAccessException("Invalid username");

            var storedHash = Convert.FromBase64String(user.PasswordHash);
            var storedSalt = Convert.FromBase64String(user.PasswordSalt);


            bool isPasswordValid = _authService.VerifyPasswordHash(dto.Password, storedHash, storedSalt);

            if (!isPasswordValid)
                throw new UnauthorizedAccessException("Invalid password");


            //generating token
            var token = _authService.GenerateToken(
                user.UserId.ToString(),
                user.User.Role.ToString(),
                user.Username
               );

            //update last login
            user.LastLoginOn = DateTime.Now;

            await _repo.UpdateLoginAsync(user);

            return token;
        }

       







    }
}