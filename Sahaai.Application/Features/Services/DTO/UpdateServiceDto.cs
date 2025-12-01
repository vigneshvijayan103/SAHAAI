using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Services.DTO
{
    public class UpdateServiceDto
    {
        public string? ServiceName { get; set; }

        public string? Description { get; set; }
        public IFormFile? Image { get; set; }

        public bool IsActive { get; set; }
    }
}
