using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.UserProfile;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Services
{
    public class UserProfileService: IUserProfileService
    {
        private readonly IUserProfileRepository _repo;
        private readonly IAuthService _authService;

        public UserProfileService(IUserProfileRepository userProfileRepository,IAuthService authService)
        {
            _repo = userProfileRepository;
            _authService = authService;
        }

        //Get user profile by userId
        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _repo.GetProfileAsync(userId);

            if (user == null)
                return null;

            return new UserProfileDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.Phone,
                Username = user.Login.Username
            };

        }

        //update user profile
        public async Task<User?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
        {

            var user = await _repo.GetProfileAsync(userId);
            if (user == null) return null;

            user.FullName = dto.FullName;
            user.Phone = dto.PhoneNumber;
            user.ModifiedOn = DateTime.UtcNow;
            user.ModifiedBy = "User";

            await _userProfileRepository.UpdateUserAsync(user);

            return user;

        }

        //update password
       public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {

            var user = await _userProfileRepository.GetProfileAsync(userId)
               ?? throw new KeyNotFoundException("User not found");


            //verify old password
            var storedHash = Convert.FromBase64String(user.Login.PasswordHash);
            var storedSalt = Convert.FromBase64String(user.Login.PasswordSalt);

            if (!_authService.VerifyPasswordHash(dto.CurrentPassword, storedHash, storedSalt))
                throw new UnauthorizedAccessException("Current password is incorrect");

            //create new password hash
            _authService.CreatePasswordHash(dto.NewPassword, out byte[] newHash, out byte[] newSalt);

            //check if new password is same as old password
            if (_authService.VerifyPasswordHash(dto.NewPassword, storedHash, storedSalt))
                throw new InvalidOperationException("New password must be different from old password");

            user.Login.PasswordHash = Convert.ToBase64String(newHash);
            user.Login.PasswordSalt = Convert.ToBase64String(newSalt);
            user.ModifiedOn = DateTime.UtcNow;
            user.ModifiedBy = "User";

            await _repo.UpdateUserAsync(user);

            return true;

        }



    }
}
