using Sahaai.Application.Features.Users.DTO.UserProfile;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.Interfaces
{
    public interface IUserProfileRepository
    {
        Task<User?> GetProfileAsync(int userId);

        Task UpdateUserAsync(User user);

    }
}
