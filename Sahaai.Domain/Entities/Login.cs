using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Domain.Entities
{
    public class Login
    {
        public int Id { get; set; }

        public int UserId { get; set; }              // FK → User

        public string Username { get; set; }       
        public string PasswordHash { get; set; }     

        public string PasswordSalt { get; set; }
        public DateTime? LastLoginOn { get; set; }
        public string? LastLoginIp { get; set; }

      
        public User User { get; set; }
    }
}
