using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.RequestService.DTO
{
    public class ServiceRequestStatusDto
    {
        public int RequestId { get; set; }
        public string Status { get; set; }
        public bool IsAssigned { get; set; }
        public int? AssignedWorkerId { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public double SearchRadius { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
