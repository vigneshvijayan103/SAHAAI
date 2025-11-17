using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Common
{
    public class ApiResponse<T>
    {
        public int StatusCode { get; set; }
        public string StatusMessage { get; set; }
        public T Data { get; set; }

        public ApiResponse(int statusCode, string message, T data = default)
        {
            StatusCode = statusCode;
            StatusMessage = message;
            Data = data;
        }
    }
}

