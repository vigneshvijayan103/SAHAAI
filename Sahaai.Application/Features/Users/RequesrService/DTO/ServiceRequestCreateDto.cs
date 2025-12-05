using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.RequesrService.DTO
{
    public class ServiceRequestCreateDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [Required]
        public string Title { get; set; }

        public string? Description { get; set; }

        [Required]
        public int AddressId { get; set; }

       
        public List<IFormFile>? ImageFiles { get; set; }

       
        public IFormFile? AudioFile { get; set; }
    }
}
