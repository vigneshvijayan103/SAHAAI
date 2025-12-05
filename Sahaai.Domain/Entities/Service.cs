using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public class Service:BaseEntity
    {
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<ServiceRequest> ServiceRequests { get; set; }


    }
}   

