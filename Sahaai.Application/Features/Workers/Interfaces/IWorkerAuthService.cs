using Sahaai.Application.Common;
using Sahaai.Application.Features.Users.DTO.Auth;
using Sahaai.Application.Features.Workers.DTO;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Workers.Interfaces
{
    public interface IWorkerAuthService
    {
        Task<ApiResponse<object>> RegisterWorkerAsync(WorkerRegisterDto dto);
        Task<ApiResponse<LoginResponseDto>> LoginWorkerAsync(UserLoginDto dto);
    }
}

