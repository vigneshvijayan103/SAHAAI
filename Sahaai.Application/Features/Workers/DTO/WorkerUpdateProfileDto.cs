using Microsoft.AspNetCore.Http;

namespace Sahaai.Application.Features.Workers.DTO
{
    public class WorkerUpdateProfileDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public IFormFile? Photo { get; set; }
    }
}

