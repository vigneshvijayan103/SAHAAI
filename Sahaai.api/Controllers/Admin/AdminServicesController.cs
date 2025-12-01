using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Services.DTO;
using Sahaai.Application.Features.Services.DTO.ServiceManage;
using Sahaai.Application.Features.Services.Interfaces;


namespace Sahaai.Api.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminServicesController : ControllerBase
    {
        private readonly IServiceManager _service;

        public AdminServicesController(IServiceManager service)
        {
            _service = service;
        }

        //Add service
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateService([FromForm] CreateServiceDto dto)
        {
            var result = await _service.CreateAsync(dto);

            return Ok(new ApiResponse<object>(200, "Service created successfully", result));
        }



        //get services
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var services = await _service.GetAllAsync();

            return Ok(new ApiResponse<object>(200, "Service list", services));
        }



        //get service by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var service = await _service.GetByIdAsync(id);

            if (service == null)
                return NotFound(new ApiResponse<object>(404, "Service not found"));

            return Ok(new ApiResponse<object>(200, "Service details", service));
        }



        //update service
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] UpdateServiceDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            if (result == null)
                return NotFound(new ApiResponse<object>(404, "Service not found"));

            return Ok(new ApiResponse<object>(200, "Service updated successfully", result));
        }



        //delete service
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound(new ApiResponse<object>(404, "Service not found"));

            return Ok(new ApiResponse<bool>(200, "Service deleted successfully", true));
        }


    }

}
