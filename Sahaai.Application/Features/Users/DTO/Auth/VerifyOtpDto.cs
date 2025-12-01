using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Users.DTO.Auth
{
    public class VerifyOtpDto
    {
        public int Id { get; set; }
        public string Otp { get; set; }
    }
}
