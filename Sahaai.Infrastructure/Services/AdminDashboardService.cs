using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Admin.DTO;
using Sahaai.Application.Features.Admin.Interfaces;
using Sahaai.Infrastructure.Data;
using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly AppDbContext _context;

        public AdminDashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var totalUsers = await _context.Users.CountAsync(u => !u.IsDeleted);
            var totalServices = await _context.Service.CountAsync(s => !s.IsDeleted);
            var totalRequests = await _context.ServiceRequests.CountAsync(r => !r.IsDeleted);

            var activeStatuses = new[] 
            { 
                ServiceRequestStatus.Pending, 
                ServiceRequestStatus.Searching, 
                ServiceRequestStatus.ExpandingRadius, 
                ServiceRequestStatus.Accepted, 
                ServiceRequestStatus.InProgress 
            };

            var activeRequests = await _context.ServiceRequests
                .CountAsync(r => !r.IsDeleted && activeStatuses.Contains(r.Status));

            var completedRequests = await _context.ServiceRequests
                .CountAsync(r => !r.IsDeleted && r.Status == ServiceRequestStatus.Completed);

            var cancelledRequests = await _context.ServiceRequests
                .CountAsync(r => !r.IsDeleted && r.Status == ServiceRequestStatus.Cancelled);

            var pendingRequests = await _context.ServiceRequests
                .CountAsync(r => !r.IsDeleted && r.Status == ServiceRequestStatus.Pending);

            var newUsersThisMonth = await _context.Users
                .CountAsync(u => !u.IsDeleted && u.CreatedOn >= startOfMonth);

            var requestsByStatus = await _context.ServiceRequests
                .Where(r => !r.IsDeleted)
                .GroupBy(r => r.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var recentRequests = await _context.ServiceRequests
                .Where(r => !r.IsDeleted)
                .Include(r => r.User)
                .Include(r => r.Service)
                .OrderByDescending(r => r.CreatedOn)
                .Take(10)
                .Select(r => new RecentRequestDto
                {
                    RequestId = r.Id,
                    Title = r.Title,
                    Status = r.Status.ToString(),
                    UserName = r.User.FullName,
                    ServiceName = r.Service.ServiceName,
                    CreatedOn = r.CreatedOn
                })
                .ToListAsync();

            return new DashboardStatsDto
            {
                TotalUsers = totalUsers,
                TotalServices = totalServices,
                TotalRequests = totalRequests,
                ActiveRequests = activeRequests,
                CompletedRequests = completedRequests,
                CancelledRequests = cancelledRequests,
                PendingRequests = pendingRequests,
                NewUsersThisMonth = newUsersThisMonth,
                RequestsByStatus = requestsByStatus,
                RecentRequests = recentRequests
            };
        }
    }
}

