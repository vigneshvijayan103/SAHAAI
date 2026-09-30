using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Application.Features.Workers.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class WorkerService : IWorkerService
    {
        private static readonly ConcurrentDictionary<int, bool> _memoryOnlineStatus = new();
        private static readonly ConcurrentDictionary<int, string> _memoryStatus = new();
        private static readonly ConcurrentDictionary<int, (double lat, double lng)> _memoryLocations = new();
        private readonly AppDbContext _context;
        private readonly IWorkerRepository _workerRepo;
        private readonly ICloudinaryService _cloudinary;
        private readonly IDistributedCache _cache;
        private readonly IWorkerNotificationService _notificationService;
        private readonly ILogger<WorkerService> _logger;

        public WorkerService(
            AppDbContext context,
            IWorkerRepository workerRepo,
            ICloudinaryService cloudinary,
            IDistributedCache cache,
            IWorkerNotificationService notificationService,
            ILogger<WorkerService> logger)
        {
            _context = context;
            _workerRepo = workerRepo;
            _cloudinary = cloudinary;
            _cache = cache;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<WorkerProfileDto?> GetProfileAsync(int workerUserId)
        {
            var workerDetails = await _workerRepo.GetByUserIdAsync(workerUserId);
            if (workerDetails == null || workerDetails.User == null)
            {
                return null;
            }

            var status = await GetWorkerStatusAsync(workerUserId);
            var isOnline = status != "Offline";
            var (lat, lng) = await GetWorkerCachedLocationAsync(workerUserId);

            return new WorkerProfileDto
            {
                WorkerId = workerUserId,
                FullName = workerDetails.User.FullName,
                Email = workerDetails.User.Email,
                Phone = workerDetails.User.Phone,
                Username = workerDetails.User.Login?.Username ?? string.Empty,
                AadhaarNumber = workerDetails.AadhaarNumber,
                PhotoUrl = workerDetails.PhotoUrl,
                IsActive = workerDetails.User.IsActive,
                IsOnline = isOnline,
                Status = status,
                CurrentLatitude = lat,
                CurrentLongitude = lng
            };
        }

        public async Task<WorkerProfileDto?> UpdateProfileAsync(int workerUserId, WorkerUpdateProfileDto dto)
        {
            var workerDetails = await _workerRepo.GetByUserIdAsync(workerUserId);
            if (workerDetails == null || workerDetails.User == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(dto.FullName))
            {
                workerDetails.User.FullName = dto.FullName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(dto.Phone))
            {
                workerDetails.User.Phone = dto.Phone.Trim();
            }

            if (dto.Photo != null && dto.Photo.Length > 0)
            {
                try
                {
                    workerDetails.PhotoUrl = await _cloudinary.UploadImageAsync(dto.Photo);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to upload updated worker photo to Cloudinary.");
                }
            }

            workerDetails.ModifiedBy = "Worker";
            workerDetails.ModifiedOn = DateTime.UtcNow;
            workerDetails.User.ModifiedBy = "Worker";
            workerDetails.User.ModifiedOn = DateTime.UtcNow;

            await _workerRepo.SaveChangesAsync();
            return await GetProfileAsync(workerUserId);
        }

        public async Task<string> GetWorkerStatusAsync(int workerUserId)
        {
            var hasActiveJob = await _context.ServiceRequests.AnyAsync(r =>
                !r.IsDeleted &&
                r.AsssignWorkerId == workerUserId &&
                (r.Status == ServiceRequestStatus.Accepted || r.Status == ServiceRequestStatus.InProgress));

            if (hasActiveJob)
            {
                return "OnDuty";
            }

            try
            {
                var cachedStatus = await _cache.GetStringAsync($"worker:{workerUserId}:status");
                if (!string.IsNullOrWhiteSpace(cachedStatus))
                {
                    if (cachedStatus.Equals("OnDuty", StringComparison.OrdinalIgnoreCase))
                    {
                        await UpdateAvailabilityStatusAsync(workerUserId, "Online");
                        return "Online";
                    }
                    return cachedStatus;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DistributedCache unavailable in GetWorkerStatusAsync. Checking in-memory store.");
            }

            if (_memoryStatus.TryGetValue(workerUserId, out var memStatus))
            {
                if (memStatus.Equals("OnDuty", StringComparison.OrdinalIgnoreCase))
                {
                    _memoryStatus[workerUserId] = "Online";
                    return "Online";
                }
                return memStatus;
            }

            return "Offline";
        }

        public async Task<bool> UpdateAvailabilityStatusAsync(int workerUserId, string status)
        {
            var normalized = status?.Trim();
            if (string.Equals(normalized, "true", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(normalized, "online", StringComparison.OrdinalIgnoreCase))
            {
                normalized = "Online";
            }
            else if (string.Equals(normalized, "onduty", StringComparison.OrdinalIgnoreCase))
            {
                normalized = "OnDuty";
            }
            else
            {
                normalized = "Offline";
            }

            var currentStatus = await GetWorkerStatusAsync(workerUserId);
            if (currentStatus == "OnDuty" && normalized != "OnDuty")
            {
                _logger.LogWarning("Worker {WorkerId} is OnDuty with an active job and cannot manually change status to {Status}.", workerUserId, normalized);
                return false;
            }

            var statusKey = $"worker:{workerUserId}:status";
            var onlineKey = $"worker:{workerUserId}:online";
            var isOnlineBool = normalized != "Offline";

            try
            {
                await _cache.SetStringAsync(statusKey, normalized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
                });
                await _cache.SetStringAsync(onlineKey, isOnlineBool.ToString(), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DistributedCache unavailable in UpdateAvailabilityStatusAsync. Falling back to in-memory store.");
            }

            _memoryStatus[workerUserId] = normalized;
            _memoryOnlineStatus[workerUserId] = isOnlineBool;
            return true;
        }

        public async Task<bool> UpdateAvailabilityAsync(int workerUserId, bool isOnline)
        {
            return await UpdateAvailabilityStatusAsync(workerUserId, isOnline ? "Online" : "Offline");
        }

        public async Task<bool> UpdateLocationAsync(int workerUserId, double latitude, double longitude)
        {
            var locationKey = $"worker:{workerUserId}:location";
            var locationData = JsonSerializer.Serialize(new
            {
                latitude,
                longitude,
                updatedAt = DateTime.UtcNow
            });

            try
            {
                await _cache.SetStringAsync(locationKey, locationData, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(4)
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DistributedCache unavailable in UpdateLocationAsync. Falling back to in-memory store.");
            }

            _memoryLocations[workerUserId] = (latitude, longitude);

            // Heartbeat automatically keeps worker online
            await UpdateAvailabilityAsync(workerUserId, true);

            // If worker has an active job (Accepted or InProgress), broadcast live location to user and request group
            try
            {
                var activeRequest = await _context.ServiceRequests
                    .Where(r => !r.IsDeleted &&
                                r.AsssignWorkerId == workerUserId &&
                                (r.Status == ServiceRequestStatus.Accepted || r.Status == ServiceRequestStatus.InProgress))
                    .Select(r => new { r.Id, r.UserId })
                    .FirstOrDefaultAsync();

                if (activeRequest != null)
                {
                    await _notificationService.NotifyWorkerLocationUpdatedAsync(
                        workerUserId,
                        activeRequest.Id,
                        activeRequest.UserId,
                        latitude,
                        longitude
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast live location update for worker {WorkerId}", workerUserId);
            }

            return true;
        }

        public async Task<List<WorkerJobDto>> GetAvailableJobsAsync(
            int workerUserId,
            double? latitude = null,
            double? longitude = null,
            double? radiusKm = null)
        {
            var workerStatus = await GetWorkerStatusAsync(workerUserId);
            if (workerStatus == "OnDuty" || workerStatus == "Offline")
            {
                // Workers on duty or offline do not receive new job alerts / available job dispatches
                return new List<WorkerJobDto>();
            }

            // If coordinates not supplied in query, check cached location
            if (!latitude.HasValue || !longitude.HasValue)
            {
                var (cachedLat, cachedLng) = await GetWorkerCachedLocationAsync(workerUserId);
                latitude ??= cachedLat;
                longitude ??= cachedLng;
            }

            double effectiveRadius = radiusKm ?? 25.0; // Default 25km dispatch radius

            var query = _context.ServiceRequests
                .Where(r => !r.IsDeleted &&
                            (!r.IsAssigned || r.AsssignWorkerId == null) &&
                            (r.Status == ServiceRequestStatus.Searching ||
                             r.Status == ServiceRequestStatus.ExpandingRadius ||
                             r.Status == ServiceRequestStatus.Pending))
                .Include(r => r.Service)
                .Include(r => r.User)
                .Include(r => r.Address)
                .AsNoTracking();

            var list = await query.ToListAsync();

            var result = new List<WorkerJobDto>();
            foreach (var r in list)
            {
                double? distance = null;
                if (latitude.HasValue && longitude.HasValue && r.Latitude != 0 && r.Longitude != 0)
                {
                    distance = CalculateHaversineDistanceKm(latitude.Value, longitude.Value, r.Latitude, r.Longitude);
                    if (distance > effectiveRadius)
                    {
                        continue; // Outside worker's reach
                    }
                }

                result.Add(MapToJobDto(r, distance));
            }

            // Order by closest distance if available, otherwise by creation date descending
            return result
                .OrderBy(r => r.DistanceKm ?? double.MaxValue)
                .ThenByDescending(r => r.CreatedOn)
                .ToList();
        }

        public async Task<WorkerJobDto?> GetCurrentJobAsync(int workerUserId)
        {
            var activeRequest = await _context.ServiceRequests
                .Where(r => !r.IsDeleted &&
                            r.AsssignWorkerId == workerUserId &&
                            (r.Status == ServiceRequestStatus.Accepted || r.Status == ServiceRequestStatus.InProgress))
                .Include(r => r.Service)
                .Include(r => r.User)
                .Include(r => r.Address)
                .OrderByDescending(r => r.AcceptedAt)
                .FirstOrDefaultAsync();

            if (activeRequest == null)
            {
                return null;
            }

            var (lat, lng) = await GetWorkerCachedLocationAsync(workerUserId);
            double? distance = null;
            if (lat.HasValue && lng.HasValue && activeRequest.Latitude != 0 && activeRequest.Longitude != 0)
            {
                distance = CalculateHaversineDistanceKm(lat.Value, lng.Value, activeRequest.Latitude, activeRequest.Longitude);
            }

            return MapToJobDto(activeRequest, distance);
        }

        public async Task<WorkerJobDto?> GetJobDetailsAsync(int workerUserId, int requestId)
        {
            var request = await _context.ServiceRequests
                .Where(r => r.Id == requestId && !r.IsDeleted)
                .Include(r => r.Service)
                .Include(r => r.User)
                .Include(r => r.Address)
                .FirstOrDefaultAsync();

            if (request == null)
            {
                return null;
            }

            var (lat, lng) = await GetWorkerCachedLocationAsync(workerUserId);
            double? distance = null;
            if (lat.HasValue && lng.HasValue && request.Latitude != 0 && request.Longitude != 0)
            {
                distance = CalculateHaversineDistanceKm(lat.Value, lng.Value, request.Latitude, request.Longitude);
            }

            return MapToJobDto(request, distance);
        }

        public async Task<List<WorkerJobDto>> GetJobHistoryAsync(int workerUserId)
        {
            var requests = await _context.ServiceRequests
                .Where(r => r.AsssignWorkerId == workerUserId && !r.IsDeleted)
                .Include(r => r.Service)
                .Include(r => r.User)
                .Include(r => r.Address)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();

            return requests.Select(r => MapToJobDto(r, null)).ToList();
        }

        public async Task<bool> AcceptJobAsync(int workerUserId, int requestId)
        {
            // Worker is not allowed to take two jobs at the same time
            var hasActiveJob = await _context.ServiceRequests
                .AnyAsync(r => !r.IsDeleted &&
                               r.AsssignWorkerId == workerUserId &&
                               (r.Status == ServiceRequestStatus.Accepted || r.Status == ServiceRequestStatus.InProgress));

            if (hasActiveJob)
            {
                _logger.LogWarning("Worker {WorkerId} attempted to accept job {RequestId}, but already has an active job in progress.", workerUserId, requestId);
                return false;
            }

            var request = await _context.ServiceRequests
                .Include(r => r.User)
                .Include(r => r.Service)
                .FirstOrDefaultAsync(r => r.Id == requestId && !r.IsDeleted);

            if (request == null)
            {
                return false;
            }

            // Must not be already assigned or completed
            if (request.IsAssigned || request.AsssignWorkerId.HasValue ||
                request.Status == ServiceRequestStatus.Completed ||
                request.Status == ServiceRequestStatus.Cancelled)
            {
                return false;
            }

            var workerUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == workerUserId);
            if (workerUser == null)
            {
                return false;
            }

            request.AsssignWorkerId = workerUserId;
            request.IsAssigned = true;
            request.Status = ServiceRequestStatus.Accepted;
            request.AcceptedAt = DateTime.UtcNow;
            request.ModifiedBy = "Worker";
            request.ModifiedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Set worker status to OnDuty when accepting work
            await UpdateAvailabilityStatusAsync(workerUserId, "OnDuty");

            // Fetch worker photo, contact details, and location
            var workerDetails = await _workerRepo.GetByUserIdAsync(workerUserId);
            var workerPhone = workerDetails?.User?.Phone ?? workerUser.Phone;
            var workerPhoto = workerDetails?.PhotoUrl;
            var (lat, lng) = await GetWorkerCachedLocationAsync(workerUserId);

            // Notify Customer via SignalR
            await _notificationService.NotifyUserRequestAcceptedAsync(
                request.UserId,
                requestId,
                workerUserId,
                workerUser.FullName,
                workerPhone,
                workerPhoto,
                lat,
                lng
            );

            return true;
        }

        public async Task<(bool Success, string Message)> StartJobAsync(int workerUserId, int requestId, double? latitude = null, double? longitude = null)
        {
            var request = await _context.ServiceRequests
                .Include(r => r.Address)
                .FirstOrDefaultAsync(r => r.Id == requestId && r.AsssignWorkerId == workerUserId && !r.IsDeleted);

            if (request == null || request.Status != ServiceRequestStatus.Accepted)
            {
                return (false, "Unable to start job. Request must be in Accepted status.");
            }

            // Determine worker coordinates (passed in or cached)
            double? wLat = latitude;
            double? wLng = longitude;

            if (!wLat.HasValue || !wLng.HasValue)
            {
                var (cachedLat, cachedLng) = await GetWorkerCachedLocationAsync(workerUserId);
                wLat ??= cachedLat;
                wLng ??= cachedLng;
            }

            if (!wLat.HasValue || !wLng.HasValue)
            {
                return (false, "Could not verify your location. Please turn on GPS or update your location in the app before starting the job.");
            }

            // Determine destination coordinates
            double targetLat = request.Latitude;
            double targetLng = request.Longitude;

            if ((targetLat == 0 && targetLng == 0) && request.Address != null)
            {
                targetLat = request.Address.Latitude;
                targetLng = request.Address.Longitude;
            }

            if (targetLat != 0 || targetLng != 0)
            {
                double distanceKm = CalculateHaversineDistanceKm(wLat.Value, wLng.Value, targetLat, targetLng);
                const double maxAllowedDistanceKm = 0.2; // 200 meters proximity threshold

                if (distanceKm > maxAllowedDistanceKm)
                {
                    string distanceText = distanceKm < 1.0
                        ? $"{Math.Round(distanceKm * 1000)} meters"
                        : $"{distanceKm:F2} km";

                    _logger.LogWarning("Worker {WorkerId} attempted to start job {RequestId} but is {DistanceText} away from destination.",
                        workerUserId, requestId, distanceText);

                    return (false, $"Please reach the customer location to start the job. You are currently {distanceText} away.");
                }
            }

            request.Status = ServiceRequestStatus.InProgress;
            request.ModifiedBy = "Worker";
            request.ModifiedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Notify Customer via SignalR
            await _notificationService.NotifyUserRequestStartedAsync(request.UserId, requestId);

            return (true, "Job started successfully.");
        }

        public async Task<bool> CompleteJobAsync(int workerUserId, int requestId, string? notes)
        {
            var request = await _context.ServiceRequests
                .FirstOrDefaultAsync(r => r.Id == requestId && r.AsssignWorkerId == workerUserId && !r.IsDeleted);

            if (request == null || request.Status != ServiceRequestStatus.InProgress)
            {
                return false;
            }

            request.Status = ServiceRequestStatus.Completed;
            request.CompletedAt = DateTime.UtcNow;
            request.ModifiedBy = "Worker";
            request.ModifiedOn = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // When job is completed, return worker status to Online
            await UpdateAvailabilityStatusAsync(workerUserId, "Online");

            // Notify Customer via SignalR
            await _notificationService.NotifyUserRequestCompletedAsync(request.UserId, requestId);

            return true;
        }

        public async Task<bool> RejectJobAsync(int workerUserId, int requestId, string? reason)
        {
            var request = await _context.ServiceRequests
                .FirstOrDefaultAsync(r => r.Id == requestId && !r.IsDeleted);

            if (request == null)
            {
                return false;
            }

            // If the worker was already assigned, release back to pool
            if (request.AsssignWorkerId == workerUserId)
            {
                request.AsssignWorkerId = null;
                request.IsAssigned = false;
                request.Status = ServiceRequestStatus.Searching;
                request.CancellationReason = string.IsNullOrWhiteSpace(reason) ? "Declined by worker" : reason;
                request.ModifiedBy = "Worker";
                request.ModifiedOn = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Reset worker status back to Online
                await UpdateAvailabilityStatusAsync(workerUserId, "Online");
            }

            return true;
        }

        public async Task<WorkerDashboardStatsDto> GetDashboardStatsAsync(int workerUserId)
        {
            var jobs = await _context.ServiceRequests
                .Where(r => r.AsssignWorkerId == workerUserId && !r.IsDeleted)
                .AsNoTracking()
                .ToListAsync();

            var totalAssigned = jobs.Count;
            var completed = jobs.Count(j => j.Status == ServiceRequestStatus.Completed);
            var active = jobs.Count(j => j.Status == ServiceRequestStatus.Accepted || j.Status == ServiceRequestStatus.InProgress);
            var cancelled = jobs.Count(j => j.Status == ServiceRequestStatus.Cancelled);

            var activeJob = await GetCurrentJobAsync(workerUserId);
            var status = await GetWorkerStatusAsync(workerUserId);
            var isOnline = status != "Offline";
            var (lat, lng) = await GetWorkerCachedLocationAsync(workerUserId);

            return new WorkerDashboardStatsDto
            {
                TotalAssignedJobs = totalAssigned,
                CompletedJobs = completed,
                ActiveJobs = active,
                CancelledJobs = cancelled,
                IsOnline = isOnline,
                Status = status,
                CurrentLatitude = lat,
                CurrentLongitude = lng,
                ActiveJob = activeJob
            };
        }

        #region Helpers

        private static WorkerJobDto MapToJobDto(ServiceRequest r, double? distanceKm)
        {
            return new WorkerJobDto
            {
                RequestId = r.Id,
                Title = r.Title,
                Description = r.Description,
                ServiceName = r.Service != null ? r.Service.ServiceName : "Emergency Service",
                CustomerName = r.User != null ? r.User.FullName : "Customer",
                CustomerPhone = r.User != null ? r.User.Phone : string.Empty,
                AddressLine = r.Address != null ? r.Address.FullAddress : null,
                Latitude = r.Latitude,
                Longitude = r.Longitude,
                DistanceKm = distanceKm.HasValue ? Math.Round(distanceKm.Value, 2) : null,
                Status = r.Status.ToString(),
                ImageUrls = r.ImageUrls != null
                    ? r.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(u => u.Trim()).ToList()
                    : new List<string>(),
                AudioUrl = r.AudioUrl,
                CreatedOn = r.CreatedOn,
                AcceptedAt = r.AcceptedAt,
                CompletedAt = r.CompletedAt,
                CancellationReason = r.CancellationReason
            };
        }

        private async Task<bool> GetWorkerOnlineStatusAsync(int workerUserId)
        {
            try
            {
                var val = await _cache.GetStringAsync($"worker:{workerUserId}:online");
                if (bool.TryParse(val, out var online))
                {
                    return online;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DistributedCache unavailable in GetWorkerOnlineStatusAsync. Checking in-memory store.");
            }

            if (_memoryOnlineStatus.TryGetValue(workerUserId, out var memOnline))
            {
                return memOnline;
            }

            return false;
        }

        private async Task<(double? lat, double? lng)> GetWorkerCachedLocationAsync(int workerUserId)
        {
            try
            {
                var json = await _cache.GetStringAsync($"worker:{workerUserId}:location");
                if (string.IsNullOrWhiteSpace(json))
                {
                    return (null, null);
                }

                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                double lat = root.GetProperty("latitude").GetDouble();
                double lng = root.GetProperty("longitude").GetDouble();
                return (lat, lng);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "DistributedCache unavailable in GetWorkerCachedLocationAsync. Checking in-memory store.");
            }

            if (_memoryLocations.TryGetValue(workerUserId, out var memLoc))
            {
                return (memLoc.lat, memLoc.lng);
            }

            return (null, null);
        }

        public async Task<(double? Latitude, double? Longitude)> GetWorkerLocationAsync(int workerUserId)
        {
            return await GetWorkerCachedLocationAsync(workerUserId);
        }

        private static double CalculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double r = 6371; // Earth radius in km
            var dLat = (lat2 - lat1) * (Math.PI / 180.0);
            var dLon = (lon2 - lon1) * (Math.PI / 180.0);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * (Math.PI / 180.0)) * Math.Cos(lat2 * (Math.PI / 180.0)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return r * c;
        }

        #endregion
    }
}
