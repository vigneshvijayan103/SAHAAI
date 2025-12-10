using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.DTO
{
    public class ServiceRequestDetailsDto
    {
        public int RequestId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public List<string>? ImageUrls { get; set; }
        public string? AudioUrl { get; set; }

        public string  Status { get; set; }

        public string AddressLine { get; set; }    
        
        public int? AssignedWorkerId { get; set; }
        public string? AssignedWorkerName { get; set; }

        public DateTime CreatedOn { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
