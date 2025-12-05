using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.RequesrService
{
    public class ServiceRequestResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ServiceId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int AddressId { get; set; }

        public List<string> ImageUrls { get; set; }
        public string? AudioUrl { get; set; }

        public int? AssignedWorkerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
    }

}
