using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public class WorkerDetails:BaseEntity
    {
        public int UserId { get; set; }
        public string AadhaarNumber { get; set; }

        public string PhotoUrl { get; set; }

        public User User { get; set; }
    }
}

