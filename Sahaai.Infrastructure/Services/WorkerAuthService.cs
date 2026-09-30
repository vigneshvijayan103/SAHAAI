using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Application.Features.Workers.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using Sahaai.Infrastructure.Data;
using System;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class WorkerAuthService : IWorkerAuthService
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ILogger<WorkerAuthService> _logger;

        public WorkerAuthService(
            AppDbContext context,
            IAuthService authService,
            ICloudinaryService cloudinaryService,
            ILogger<WorkerAuthService> logger)
        {
            _context = context;
            _authService = authService;
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        public async Task<ApiResponse<object>> RegisterWorkerAsync(WorkerRegisterDto dto)
        {
            // 1. Check if email already registered
            var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLower());
            if (emailExists)
            {
                return new ApiResponse<object>(400, "Email is already registered.", null);
            }

            // 2. Check if username already exists
            var usernameExists = await _context.Logins.AnyAsync(l => l.Username.ToLower() == dto.Username.Trim().ToLower());
            if (usernameExists)
            {
                return new ApiResponse<object>(400, "Username is already taken.", null);
            }

            // 3. Check if Aadhaar number is already registered
            var aadhaarExists = await _context.WorkerDetails.AnyAsync(w => w.AadhaarNumber == dto.AadhaarNumber.Trim() && !w.IsDeleted);
            if (aadhaarExists)
            {
                return new ApiResponse<object>(400, "Aadhaar number is already registered with another worker account.", null);
            }

            // 4. Upload photo if provided
            string photoUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200";
            if (dto.Photo != null && dto.Photo.Length > 0)
            {
                try
                {
                    photoUrl = await _cloudinaryService.UploadImageAsync(dto.Photo);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to upload worker photo to Cloudinary, fallback to default photo.");
                }
            }

            // 5. Hash password
            _authService.CreatePasswordHash(dto.Password, out byte[] hash, out byte[] salt);

            // 6. Create User, Login, and WorkerDetails entities
            var workerUser = new User
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                Phone = dto.Phone.Trim(),
                Role = UserRole.Worker,
                IsActive = true,
                IsEmailVerified = true,
                EmailVerifiedAt = DateTime.UtcNow,
                CreatedBy = "WorkerOnboarding",
                CreatedOn = DateTime.UtcNow,
                Login = new Login
                {
                    Username = dto.Username.Trim(),
                    PasswordHash = Convert.ToBase64String(hash),
                    PasswordSalt = Convert.ToBase64String(salt)
                },
                WorkerDetails = new WorkerDetails
                {
                    AadhaarNumber = dto.AadhaarNumber.Trim(),
                    PhotoUrl = photoUrl,
                    CreatedBy = "WorkerOnboarding",
                    CreatedOn = DateTime.UtcNow
                }
            };

            await _context.Users.AddAsync(workerUser);
            await _context.SaveChangesAsync();

            return new ApiResponse<object>(200, "Worker registered successfully.", new
            {
                userId = workerUser.Id,
                workerId = workerUser.WorkerDetails.Id,
                username = workerUser.Login.Username,
                email = workerUser.Email
            });
        }

        public async Task<ApiResponse<LoginResponseDto>> LoginWorkerAsync(UserLoginDto dto)
        {
            var login = await _context.Logins
                .Include(l => l.User)
                    .ThenInclude(u => u.WorkerDetails)
                .FirstOrDefaultAsync(l => l.Username.ToLower() == dto.UserName.Trim().ToLower());

            if (login == null)
            {
                return new ApiResponse<LoginResponseDto>(401, "Invalid username or password.", null!);
            }

            var user = login.User;
            if (user == null || user.IsDeleted || !user.IsActive)
            {
                return new ApiResponse<LoginResponseDto>(401, "Account is inactive or disabled.", null!);
            }

            if (user.Role != UserRole.Worker)
            {
                return new ApiResponse<LoginResponseDto>(403, "Access denied. This portal is strictly for registered service workers.", null!);
            }

            var storedHash = Convert.FromBase64String(login.PasswordHash);
            var storedSalt = Convert.FromBase64String(login.PasswordSalt);

            bool isPasswordValid = _authService.VerifyPasswordHash(dto.Password, storedHash, storedSalt);
            if (!isPasswordValid)
            {
                return new ApiResponse<LoginResponseDto>(401, "Invalid username or password.", null!);
            }

            // Update login metadata
            login.LastLoginOn = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT Token
            var token = _authService.GenerateToken(
                user.Id.ToString(),
                user.Role.ToString(),
                login.Username
            );

            var responseDto = new LoginResponseDto
            {
                UserId = user.Id,
                UserName = login.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                Token = token
            };

            return new ApiResponse<LoginResponseDto>(200, "Login successful.", responseDto);
        }
    }
}
