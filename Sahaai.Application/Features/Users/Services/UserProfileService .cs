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
    public  class UserProfileService
    {
        private readonly IUserProfileRepository _userProfileRepository;

        public  UserProfileService(IUserProfileRepository userProfileRepository)
        {
            _userProfileRepository = userProfileRepository;
        }

        //Get user profile by userId
        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _userProfileRepository.GetProfileAsync(userId);

            if (user == null)
                return null;

            return new UserProfileDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.Phone,
                Username=user.Login.Username
            };

        }

        //update user profile
        public async Task<User?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
        {

            var user = await _userProfileRepository.GetProfileAsync(userId);
            if (user == null) return null;

            user.FullName = dto.FullName;
            user.Phone = dto.PhoneNumber;
            user.ModifiedOn = DateTime.UtcNow;
            user.ModifiedBy = "User";

            await _userProfileRepository.UpdateUserAsync(user);

            return user;

        }

    }
}
