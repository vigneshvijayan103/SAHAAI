using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Admin.DTO;
using Sahaai.Application.Features.Admin.Interfaces;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _context;
        private readonly IWorkerNotificationService _notificationService;

        public AdminUserService(AppDbContext context, IWorkerNotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<List<AdminUserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Where(u => !u.IsDeleted)
                .OrderByDescending(u => u.CreatedOn)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    IsEmailVerified = u.IsEmailVerified,
                    CreatedOn = u.CreatedOn,
                    TotalRequests = u.ServiceRequests.Count(sr => !sr.IsDeleted)
                })
                .ToListAsync();
        }

        public async Task<AdminUserDto?> GetUserByIdAsync(int id)
        {
            return await _context.Users
                .Where(u => u.Id == id && !u.IsDeleted)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    IsEmailVerified = u.IsEmailVerified,
                    CreatedOn = u.CreatedOn,
                    TotalRequests = u.ServiceRequests.Count(sr => !sr.IsDeleted)
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ToggleUserStatusAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.WorkerDetails)
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null) return false;

            user.IsActive = !user.IsActive;
            user.ModifiedOn = DateTime.UtcNow;
            user.ModifiedBy = "Admin";
            await _context.SaveChangesAsync();

            if (!user.IsActive)
            {
                await _notificationService.NotifyUserDeactivatedAsync(user.Id, "Your account has been deactivated by an administrator.");
                if (user.WorkerDetails != null)
                {
                    await _notificationService.NotifyUserDeactivatedAsync(user.WorkerDetails.Id, "Your account has been deactivated by an administrator.");
                }
            }

            return true;
        }

        public async Task<List<AdminUserDto>> SearchUsersAsync(string query)
        {
            var lowerQuery = query.ToLower();
            return await _context.Users
                .Where(u => !u.IsDeleted &&
                    (u.FullName.ToLower().Contains(lowerQuery) ||
                     u.Email.ToLower().Contains(lowerQuery) ||
                     u.Phone.Contains(query)))
                .OrderByDescending(u => u.CreatedOn)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    IsEmailVerified = u.IsEmailVerified,
                    CreatedOn = u.CreatedOn,
                    TotalRequests = u.ServiceRequests.Count(sr => !sr.IsDeleted)
                })
                .ToListAsync();
        }
    }
}

