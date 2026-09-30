
using AutoMapper;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Application.Features.RequestService.DTO;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Application.Features.Users.RequesrService.DTO;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using Sahaai.Application.Features.Workers.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.Services
{
    public class ServiceRequestService:IServiceRequestService
    {
        private readonly IServiceRequestRepository _repo;
        private readonly ICloudinaryService _cloudinary;
        private readonly IUserAddressRepository _userAddressRepository;
        private readonly IServiceRepository _service;
        private readonly IMapper _mapper;
        private readonly IWorkerRepository _workerRepo;
        private readonly IWorkerService _workerService;

        public ServiceRequestService(IServiceRequestRepository repo,
                                    ICloudinaryService cloudinary,
                                    IUserAddressRepository userAddressRepository,
                                    IServiceRepository service,
                                    IMapper mapper,
                                    IWorkerRepository workerRepo,
                                    IWorkerService workerService)
        {
            _repo = repo;
            _cloudinary = cloudinary;
            _userAddressRepository = userAddressRepository;
            _service = service;
            _mapper = mapper;
            _workerRepo = workerRepo;
            _workerService = workerService;
        }

        //create a service
        public async Task<ServiceRequest> RaiseRequestAsync(int userId, string role, ServiceRequestCreateDto dto)
        {
            var address = await _userAddressRepository.GetByIdAsync(dto.AddressId)
                           ?? throw new KeyNotFoundException("Address not found");

            var service = await _service.GetByIdAsync(dto.ServiceId)
                        ?? throw new KeyNotFoundException("service not found");

            var request = _mapper.Map<ServiceRequest>(dto);

            request.UserId = userId;
            request.CreatedBy = role;
            request.Latitude = address.Latitude;
            request.Longitude = address.Longitude;
            request.Status = ServiceRequestStatus.Searching;
            request.SearchRadius = 5;
            request.ExpireAt = DateTime.UtcNow.AddMinutes(1);

            var imageUrls = new List<string>();
            if (dto.ImageFiles is not null && dto.ImageFiles.Count > 0)
            {
                foreach (var img in dto.ImageFiles)
                {
                    try
                    {
                        var uploadedImageUrl = await _cloudinary.UploadImageAsync(img);
                        if (!string.IsNullOrWhiteSpace(uploadedImageUrl))
                        {
                            imageUrls.Add(uploadedImageUrl);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log warning if Cloudinary fails, continue creating request
                        Console.WriteLine($"[Cloudinary] Image upload warning: {ex.Message}");
                    }
                }
            }

            if (imageUrls.Count > 0)
            {
                request.ImageUrls = string.Join(",", imageUrls);
            }

            if (dto.AudioFile != null)
            {
                try
                {
                    request.AudioUrl = await _cloudinary.UploadAudioAsync(dto.AudioFile);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Cloudinary] Audio upload warning: {ex.Message}");
                }
            }

            await _repo.AddAsync(request);
            await _repo.SaveChangesAsync();
            return request;
        }

        //cancell a service
        public async Task<bool> CancelRequestAsync(int requestId,string role,int UserId,CancelRequestDto dto)
        { 

            var request = await _repo.GetByIdAndUserIdAsync(requestId,UserId);
            if (request == null) return false;

           
            if (request.Status == ServiceRequestStatus.InProgress ||
                request.Status == ServiceRequestStatus.Completed)
                return false;

            request.Status = ServiceRequestStatus.Cancelled;
            request.CancellationReason = dto.Reason;
            request.CancelledBy = role;
            request.CancelledAt = DateTime.UtcNow;

            request.IsAssigned = false;
            request.AsssignWorkerId = null;

            await _repo.SaveChangesAsync();
            return true;
        }

        //Get the status of a service request
        public async Task<ServiceRequestStatusDto?> GetStatusDtoAsync(int requestId, int userId)
        {
            var request = await _repo.GetByIdAndUserIdAsync(requestId, userId);
            if (request == null) return null;

            var dto = _mapper.Map<ServiceRequestStatusDto>(request);
            dto.AssignedWorkerId = request.AsssignWorkerId;
            dto.IsAssigned = request.IsAssigned || request.AsssignWorkerId.HasValue;
            return dto;
        }

        //Get the history of service requests for a user
        public async Task<List<ServiceRequestHistoryDto>> GetHistoryAsync(int userId)
        {
            var requests = await _repo.GetByUserIdAsync(userId);
            return _mapper.Map<List<ServiceRequestHistoryDto>>(requests);
        }

        //Get the details of a service request
        public async Task<ServiceRequestDetailsDto?> GetDetailsAsync(int requestId)
        {
            var request = await _repo.GetDetailsByIdAsync(requestId);
            if (request == null) return null;

            string? workerName = null;
            string? workerPhone = null;
            string? workerPhoto = null;
            double? workerLat = null;
            double? workerLng = null;

            if (request.AsssignWorkerId.HasValue)
            {
                var worker = await _workerRepo.GetByUserIdAsync(request.AsssignWorkerId.Value);
                if (worker != null)
                {
                    workerName = worker.User?.FullName;
                    workerPhone = worker.User?.Phone;
                    workerPhoto = worker.PhotoUrl;
                }

                var (wLat, wLng) = await _workerService.GetWorkerLocationAsync(request.AsssignWorkerId.Value);
                workerLat = wLat;
                workerLng = wLng;
            }

            double? reqLat = request.Latitude != 0 ? request.Latitude : request.Address?.Latitude;
            double? reqLng = request.Longitude != 0 ? request.Longitude : request.Address?.Longitude;

            return new ServiceRequestDetailsDto
            {
                RequestId = request.Id,
                Title = request.Title,
                Description = request.Description,
                ImageUrls = !string.IsNullOrWhiteSpace(request.ImageUrls)
                    ? request.ImageUrls.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(u => u.Trim()).ToList()
                    : new List<string>(),
                AudioUrl = request.AudioUrl,
                Status = request.Status.ToString(),
                AddressLine = request.Address?.FullAddress ?? string.Empty,
                Latitude = reqLat,
                Longitude = reqLng,
                AssignedWorkerId = request.AsssignWorkerId,
                AssignedWorkerName = workerName,
                AssignedWorkerPhone = workerPhone,
                AssignedWorkerPhoto = workerPhoto,
                WorkerLatitude = workerLat,
                WorkerLongitude = workerLng,
                CreatedOn = request.CreatedOn,
                AcceptedAt = request.AcceptedAt,
                CancelledAt = request.CancelledAt,
                CancellationReason = request.CancellationReason,
                CompletedAt = request.CompletedAt
            };
        }





    }
}
