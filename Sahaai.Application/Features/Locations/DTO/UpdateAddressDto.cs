using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.DTO
{
    public class UpdateAddressDto
    {
        public string?FullAddress { get; set; }

        public double?  Latitude { get; set; }
        public double?  Longitude { get; set; }

        public string? City { get; set; }
        public string? State { get; set; }
        public string? Pincode { get; set; }

        public bool? IsDefault { get; set; }
    }
}
