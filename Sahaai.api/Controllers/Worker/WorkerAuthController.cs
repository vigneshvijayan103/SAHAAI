using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Workers.DTO;
using Sahaai.Application.Features.Workers.Interfaces;
using System.Threading.Tasks;

namespace Sahaai.Api.Controllers.Worker
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkerAuthController : ControllerBase
    {
        private readonly IWorkerAuthService _workerAuthService;

        public WorkerAuthController(IWorkerAuthService workerAuthService)
        {
            _workerAuthService = workerAuthService;
        }

        // POST: api/WorkerAuth/register
        [HttpPost("register")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] WorkerRegisterDto dto)
        {
            var result = await _workerAuthService.RegisterWorkerAsync(dto);
            if (result.StatusCode != 200)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        // POST: api/WorkerAuth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var result = await _workerAuthService.LoginWorkerAsync(dto);
            if (result.StatusCode == 403)
            {
                return StatusCode(403, result);
            }

            if (result.StatusCode != 200)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }
    }
}

