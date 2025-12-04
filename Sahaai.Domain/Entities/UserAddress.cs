using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public class UserAddress: BaseEntity
    {
        public int UserId { get; set; }

        public string? FullAddress { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }

        public bool IsDefault { get; set; } = false;

       
        public User User { get; set; }
    }
}
