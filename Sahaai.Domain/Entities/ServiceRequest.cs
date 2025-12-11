using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public class ServiceRequest:BaseEntity
    {
        public  int UserId { get; set; }
        public User User { get; set; }
        public int ServiceId { get; set; }
        public Service Service { get; set; }
        public string Title { get; set; }

        public string? Description { get; set; }
        public string? ImageUrls { get; set; }
        public string? AudioUrl { get; set; }

        public int AddressId { get; set; }
        public UserAddress Address { get; set; }

        public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;

        public int? AsssignWorkerId { get; set; }

        public DateTime? AcceptedAt { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double SearchRadius { get; set; } = 5;
        public DateTime? ExpireAt { get; set; }

        public bool IsAssigned { get; set; } = false;

        public string? CancellationReason { get; set; }
        public string? CancelledBy { get; set; }
        public DateTime? CancelledAt { get; set; }

        public DateTime? CompletedAt { get; set; }
    }
}
