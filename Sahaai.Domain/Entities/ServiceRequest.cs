using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public  class ServiceRequest: BaseEntity
    {
        public int UserId { get; set; }
       
        public int? WorkerId { get; set; }
        public int ServiceId { get; set; } 
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Address { get; set; }

        public string? Description { get; set; }
        public string Status { get; set; } = "Pending";
    }
}
