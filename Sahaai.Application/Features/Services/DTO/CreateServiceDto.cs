using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Services.DTO.ServiceManage
{
    public class CreateServiceDto
    {
        public string ServiceName { get; set; } = string.Empty;

        public string? Description { get; set; }

        
        public IFormFile? Image { get; set; }
    }
}
