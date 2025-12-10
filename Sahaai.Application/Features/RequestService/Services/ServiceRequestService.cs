using AutoMapper;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Application.Features.RequestService.DTO;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Application.Features.Users.RequesrService.DTO;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
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

        public ServiceRequestService(IServiceRequestRepository repo,
                                    ICloudinaryService cloudinary,
                                    IUserAddressRepository userAddressRepository,
                                    IServiceRepository service,
                                    IMapper mapper)
        {
            _repo = repo;
            _cloudinary = cloudinary;
            _userAddressRepository = userAddressRepository;
            _service = service;
            _mapper = mapper;
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
            if (dto.ImageFiles is not null && dto.ImageFiles.Count > 0) {
                foreach (var img in dto.ImageFiles) {
                    var uploadedImageUrl = await _cloudinary.UploadImageAsync(img);
                    imageUrls.Add(uploadedImageUrl); 
                } 
            }


            if (dto.AudioFile != null)
            {
                request.AudioUrl = await _cloudinary.UploadAudioAsync(dto.AudioFile);
            }

            await _repo.AddAsync(request);
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
            return request == null ? null : _mapper.Map<ServiceRequestStatusDto>(request);
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

            return new ServiceRequestDetailsDto
            {
                RequestId = request.Id,
                Title = request.Title,
                Description = request.Description,
                ImageUrls = request.ImageUrls?.Split(',').ToList(),
                AudioUrl = request.AudioUrl,
                Status = request.Status.ToString(),

                AddressLine = request.Address.FullAddress, 
              

                AssignedWorkerId = request.AsssignWorkerId,
               

                CreatedOn = request.CreatedOn,
                AcceptedAt = request.AcceptedAt,
                CancelledAt = request.CancelledAt,
                CancellationReason = request.CancellationReason,
                CompletedAt = request.CompletedAt
            };
        }





    }
}
