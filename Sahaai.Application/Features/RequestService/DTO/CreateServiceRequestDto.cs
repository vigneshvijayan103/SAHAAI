using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.DTO
{
    public class CreateServiceRequestDto
    {
        public int UserId { get; set; }
        public int ServiceId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }

        public List<IFormFile>? Images { get; set; }  
        public IFormFile? Audio { get; set; }         

        public int AddressId { get; set; }
    }
}
