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
    public class UserAuthService : IUserAuthService
    {
        private readonly IUserRepository _repo;
        private readonly IUserProfileRepository _userProfileRepo;
        private readonly IAuthService _auth;
        private readonly IMapper _mapper;
        private readonly IAuthService _authService;
        private readonly IOtpService _otpService;
        private readonly IMailkitService _mailkitService;

        public UserAuthService(IUserRepository repo,
            IUserProfileRepository userProfileRepo,
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
            _userProfileRepo = userProfileRepo;

        }



        //Register User 
        public async Task<RegisterResponseDto> RegisterUserAsync(UserRegisterDto dto)

        {
            if (await _repo.ExistsAsync(dto.Email, null))
            {
                return new RegisterResponseDto
                {
                    UserId = 0,
                    Message = "Email already exists"
                };
            }

            if (await _repo.ExistsAsync(null, dto.Username))
            {
                return new RegisterResponseDto
                {
                    UserId = 0,
                    Message = "Username already exists"
                };
            }

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

            return new RegisterResponseDto
            {
                UserId = user.Id,
                Message = "Registered successfully. OTP sent to your email"
            };

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

        public async Task<OtpVerifyResult> VerifyOtpAsync(int userId, string otp)
        {

            var user = await _userProfileRepo.GetProfileAsync(userId);

            if (user == null)
            {
                return new OtpVerifyResult
                {
                    Success = false,
                    StatusCode = 404,
                    Message = "User not found"
                };
            }


            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return new OtpVerifyResult
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "User email not found"
                };
            }


            var email = user.Email.Trim().ToLower();

            // Verify OTP
            var isValidOtp = await _otpService.VerifyOtpAsync(email, "register", otp);
            if (!isValidOtp)
            {
                return new OtpVerifyResult
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Invalid or expired OTP"
                };
            }

            // Verify user email in DB
            var verificationSuccess = await _repo.VerifyUserEmailAsync(email);

            if (!verificationSuccess)
            {
                return new OtpVerifyResult
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Failed to update email verification"
                };
            }

            return new OtpVerifyResult
            {
                Success = true,
                StatusCode = 200,
                Message = "Email verified successfully"
            };
        }


        //login user
        public async Task<LoginResponseDto> LoginAsync(UserLoginDto dto)
        {
            var login = await _repo.GetUserNameAsync(dto.UserName);


            if (login == null)
                throw new UnauthorizedAccessException("Invalid username");

            var user = login.User;

            if (!user.IsEmailVerified)
                throw new UnauthorizedAccessException("Please verify your email first");

            var storedHash = Convert.FromBase64String(login.PasswordHash);
            var storedSalt = Convert.FromBase64String(login.PasswordSalt);


            bool isPasswordValid = _authService.VerifyPasswordHash(dto.Password, storedHash, storedSalt);

            if (!isPasswordValid)
                throw new UnauthorizedAccessException("Invalid password");


            //generating token
            var token = _authService.GenerateToken(
                user.Id.ToString(),
                user.Role.ToString(),
               login.Username
               );

            //update last login
            login.LastLoginOn = DateTime.Now;

            await _repo.UpdateLoginAsync(login);

            return new LoginResponseDto
            {
                UserId = user.Id,
                UserName = login.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token
            };
        }









    }
}

