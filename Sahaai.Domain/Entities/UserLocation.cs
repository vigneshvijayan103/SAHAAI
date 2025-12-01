using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public  class UserLocation
    {
        public int UserId { get; set; }      

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public string? Address { get; set; } 

        public double Accuracy { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
