using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Sahaai.Application.Features.Workers.DTO
{
    public class WorkerRegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string AadhaarNumber { get; set; } = string.Empty;
        public IFormFile? Photo { get; set; }
    }
}

