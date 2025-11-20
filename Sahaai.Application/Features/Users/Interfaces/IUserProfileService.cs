using Sahaai.Application.Features.Users.DTO.UserProfile;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserProfileService
    {
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<User?> UpdateProfileAsync(int userId, UpdateUserProfileDto dto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);


    }
}
