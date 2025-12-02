using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Sahaai.Application.Features.Services.DTO.ServiceManage;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Services.DTO;
using AutoMapper;

namespace Sahaai.Application.Features.Services.Services
{
    public class ServiceManager:IServiceManager
    {
        private readonly IServiceRepository _repo;
        private readonly IFileService _service;
        private readonly IMapper _mapper;


        public ServiceManager(IServiceRepository repo,
                               IFileService service,
                               IMapper mapper
                               )
        {
            _repo = repo;
            _service = service;
            _mapper=mapper;
        }

        //Create Service
        public async Task<ServiceResponseDto> CreateAsync(CreateServiceDto dto)
        {
            

            var service = _mapper.Map<Service>(dto);
            service.ImageUrl = await _service.SaveImageAsync(dto.Image, "images/services");
            service.CreatedBy = "Admin";

            await _repo.AddAsync(service);
            await _repo.SaveChangesAsync();

             return _mapper.Map<ServiceResponseDto>(service);

        }

        //update Service
        public async Task<ServiceResponseDto?> UpdateAsync(int id, UpdateServiceDto dto)
        {

            var service = await _repo.GetByIdAsync(id);

            if (service == null || service.IsDeleted)
                return null;

            _mapper.Map(dto, service);

            if (dto.Image != null)
            {
                var imagePath = await _service.SaveImageAsync(dto.Image, "images/services");
                service.ImageUrl = imagePath;
            }

           
            service.ModifiedOn = DateTime.UtcNow;
            service.ModifiedBy = "Admin";

            await _repo.UpdateAsync(service);
            await _repo.SaveChangesAsync();

            return _mapper.Map<ServiceResponseDto>(service);


        }

        //soft delete Service
        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _repo.GetByIdAsync(id);

            if (service == null)
                return false;

            service.IsDeleted = true;
            service.DeletedOn = DateTime.Now;
            service.DeletedBy = "Admin";

            await _repo.UpdateAsync(service);
            await _repo.SaveChangesAsync();

            return true;

        }
        //getall services
        public async Task<List<ServiceResponseDto>> GetAllAsync()
        {
            var services=await _repo.GetAllAsync();

            var activeServices = services
                    .Where(s => !s.IsDeleted)
                    .ToList();

            return _mapper.Map<List<ServiceResponseDto>>(activeServices);
        }

        //get service by id
        public async Task<ServiceResponseDto?> GetByIdAsync(int id)
        {
            var service =await _repo.GetByIdAsync(id);

            if (service == null || service.IsDeleted)
                return null;


            return _mapper.Map<ServiceResponseDto>(service);

        }
    }
}

