using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Sahaai.Application.Common
{
    public interface IFileService
    {
        Task<string?> SaveImageAsync(IFormFile file, string folderName);

    }
}
