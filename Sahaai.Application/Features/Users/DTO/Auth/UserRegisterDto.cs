using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.DTO.Auth
{
    public class UserRegisterDto
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public string Phone { get; set; }   

        public string Username { get; set; }

        public string Password { get; set; }

        public string confirmPassword { get; set; }
    }
}
