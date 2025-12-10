using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.RequestService.DTO;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Application.Features.Users.RequesrService.DTO;
using Sahaai.Domain.Entities;
using System.Security.Claims;

namespace Sahaai.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "User")]
    public class ServiceRequestController : ControllerBase
    {
        private readonly IServiceRequestService _service;

        public ServiceRequestController(IServiceRequestService service)
        {
            _service = service;
        }


        //raise a service request
        [HttpPost("raise")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Raise([FromForm] ServiceRequestCreateDto dto)
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);
            var role = User.FindFirst("role")?.Value
                         ?? User.FindFirst(ClaimTypes.Role)?.Value;



            var request = await _service.RaiseRequestAsync(userId, role,dto);

            return Ok(new
            {
                requestId = request.Id,
                message = "Service Request Created Successfully",
                status = request.Status.ToString()
            });

        }

        //cancel service request
        [HttpDelete("cancel/{id}")]
        public async Task<IActionResult> Cancel(int id, [FromBody] CancelRequestDto dto)
        {
            var role = User.FindFirst("role")?.Value
                          ?? User.FindFirst(ClaimTypes.Role)?.Value;

            int userId = int.Parse(User.FindFirst("userId")!.Value);


            var success = await _service.CancelRequestAsync(id, role, userId ,dto);

            

            if (!success)
            {
                return Ok(new ApiResponse<string>(
                    400,
                    "Cancellation not allowed as service is already started or completed."
                ));
            }

            return Ok(new ApiResponse<string>(
                200,
                "Service Request Cancelled Successfully"
            ));
        }

        //get the status of service
        [HttpGet("status/{id}")]
        public async Task<IActionResult> GetStatus(int id)
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var result = await _service.GetStatusDtoAsync(id, userId);

            if (result == null)
            {
                return Ok(new ApiResponse<string>(
                    404,
                    "Service Request Not Found"
                ));
            }

            return Ok(new ApiResponse<ServiceRequestStatusDto>(
                200,
                "Service Request Status Retrieved Successfully",
                result
            ));
        }

        //Get service request history for user

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            int userId = int.Parse(User.FindFirst("userId")!.Value);

            var history = await _service.GetHistoryAsync(userId);

            if (history == null || !history.Any())
            {
                return Ok(new ApiResponse<string>(
                    404,
                    "No service requests found for this user."
                ));
            }

            return Ok(new ApiResponse<List<ServiceRequestHistoryDto>>(
                200,
                "Service Request History Retrieved Successfully",
                history
            ));
        }


        //Get service request details by id
        [HttpGet("details/{id}")]
        public async Task<IActionResult> GetDetails(int id)
        {
            var result = await _service.GetDetailsAsync(id);

            if (result == null)
            {
                return Ok(new ApiResponse<string>(
                    404,
                    "Service Request Not Found"
                ));
            }

            return Ok(new ApiResponse<ServiceRequestDetailsDto>(
                200,
                "Service Request Details Retrieved Successfully",
                result
            ));
        }




    }
}           
