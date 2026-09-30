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
    public class AdminServiceRequestService : IAdminServiceRequestService
    {
        private readonly AppDbContext _context;

        public AdminServiceRequestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminServiceRequestDto>> GetAllRequestsAsync()
        {
            return await _context.ServiceRequests
                .Where(r => !r.IsDeleted)
                .Include(r => r.User)
                .Include(r => r.Service)
                .Include(r => r.Address)
                .OrderByDescending(r => r.CreatedOn)
                .Select(r => new AdminServiceRequestDto
                {
                    RequestId = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Status = r.Status.ToString(),
                    UserName = r.User.FullName,
                    UserEmail = r.User.Email,
                    ServiceName = r.Service.ServiceName,
                    AddressLine = r.Address != null ? r.Address.FullAddress : null,
                    ImageUrls = r.ImageUrls != null ? r.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() : null,
                    AudioUrl = r.AudioUrl,
                    AssignedWorkerId = r.AsssignWorkerId,
                    CancellationReason = r.CancellationReason,
                    CancelledBy = r.CancelledBy,
                    CreatedOn = r.CreatedOn,
                    AcceptedAt = r.AcceptedAt,
                    CancelledAt = r.CancelledAt,
                    CompletedAt = r.CompletedAt
                })
                .ToListAsync();
        }

        public async Task<AdminServiceRequestDto?> GetRequestByIdAsync(int id)
        {
            return await _context.ServiceRequests
                .Where(r => r.Id == id && !r.IsDeleted)
                .Include(r => r.User)
                .Include(r => r.Service)
                .Include(r => r.Address)
                .Select(r => new AdminServiceRequestDto
                {
                    RequestId = r.Id,
                    Title = r.Title,
                    Description = r.Description,
                    Status = r.Status.ToString(),
                    UserName = r.User.FullName,
                    UserEmail = r.User.Email,
                    ServiceName = r.Service.ServiceName,
                    AddressLine = r.Address != null ? r.Address.FullAddress : null,
                    ImageUrls = r.ImageUrls != null ? r.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() : null,
                    AudioUrl = r.AudioUrl,
                    AssignedWorkerId = r.AsssignWorkerId,
                    CancellationReason = r.CancellationReason,
                    CancelledBy = r.CancelledBy,
                    CreatedOn = r.CreatedOn,
                    AcceptedAt = r.AcceptedAt,
                    CancelledAt = r.CancelledAt,
                    CompletedAt = r.CompletedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateRequestStatusAsync(int id, string status)
        {
            var request = await _context.ServiceRequests.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (request == null) return false;

            if (!Enum.TryParse<ServiceRequestStatus>(status, out var newStatus))
                return false;

            request.Status = newStatus;
            request.ModifiedOn = DateTime.UtcNow;
            request.ModifiedBy = "Admin";

            if (newStatus == ServiceRequestStatus.Completed)
                request.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AdminCancelRequestAsync(int id, string? reason)
        {
            var request = await _context.ServiceRequests.FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
            if (request == null) return false;

            if (request.Status == ServiceRequestStatus.Completed)
                return false;

            request.Status = ServiceRequestStatus.Cancelled;
            request.CancellationReason = reason ?? "Cancelled by admin";
            request.CancelledBy = "Admin";
            request.CancelledAt = DateTime.UtcNow;
            request.ModifiedOn = DateTime.UtcNow;
            request.ModifiedBy = "Admin";
            request.IsAssigned = false;
            request.AsssignWorkerId = null;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}

