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

    }
}
