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

namespace Sahaai.Application.Features.Services.Services
{
    public class ServiceManager:IServiceManager
    {
        private readonly IServiceRepository _repo;
        private readonly IFileService _service;


        public ServiceManager(IServiceRepository repo,
                               IFileService service)
        {
            _repo = repo;
            _service = service;
        }

        //Create Service
        public async Task<Service> CreateAsync(CreateServiceDto dto)
        {
            var imagePath = await _service.SaveImageAsync(dto.Image, "images/services");

            var service = new Service
            {
                ServiceName = dto.ServiceName,
                Description = dto.Description,
                ImageUrl = imagePath,
                CreatedBy = "Admin"
            };

            await _repo.AddAsync(service);
            await _repo.SaveChangesAsync();

            return service;
        }

        //update Service
        public async Task<ServiceResponseDto?> UpdateAsync(int id, UpdateServiceDto dto)
        {

            var service = await _repo.GetByIdAsync(id);

            if (service == null || service.IsDeleted)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.ServiceName))
                service.ServiceName = dto.ServiceName;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                service.Description = dto.Description;



            service.ServiceName = dto.ServiceName;
            service.Description = dto.Description;
            service.IsActive = dto.IsActive;
            service.ModifiedOn = DateTime.UtcNow;
            service.ModifiedBy = "Admin";

            await _repo.UpdateAsync(service);
            await _repo.SaveChangesAsync();

            return new ServiceResponseDto
            {

                Id = service.Id,
                ServiceName = service.ServiceName,



            };


        }

        //soft delete Service
        public async Task<bool> DeleteAsync(int id)
        {
            var service = await _repo.GetByIdAsync(id);
            if (service == null)
                return false;

            service.IsDeleted = true;
            service.DeletedOn = DateTime.UtcNow;
            service.DeletedBy = "Admin";

            await _repo.UpdateAsync(service);
            await _repo.SaveChangesAsync();

            return true;

        }
        //getall services
        public async Task<List<Service>> GetAllAsync()
        {
            return await _repo.GetAllAsync();
        }

        //get service by id
        public async Task<Service?> GetByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }
    }
}

