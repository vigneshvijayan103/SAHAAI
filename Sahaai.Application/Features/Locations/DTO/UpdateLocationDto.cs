using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.DTO
{
    public class UpdateLocationDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Accuracy { get; set; }
        public string? Address { get; set; }
    }
}
