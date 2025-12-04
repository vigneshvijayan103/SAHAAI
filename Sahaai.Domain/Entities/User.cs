using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Sahaai.Domain.Entities
{
    public class User:BaseEntity
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }

        public UserRole  Role { get; set; }   

        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;
        public DateTime? EmailVerifiedAt { get; set; }

        public WorkerDetails? WorkerDetails { get; set; }

        public Login? Login { get; set; }

        public ICollection<UserAddress> Addresses { get; set; }


    }
}
