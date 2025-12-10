using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Sahaai.Application.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class CloudinaryService: ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        public CloudinaryService()
        {
            var account = new Account(
                Environment.GetEnvironmentVariable("CLOUDINARY__CLOUDNAME"),
                Environment.GetEnvironmentVariable("CLOUDINARY__APIKEY"),
                Environment.GetEnvironmentVariable("CLOUDINARY__APISECRET")
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "service-request/images"
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.Url.ToString();
        }

        public async Task<string> UploadAudioAsync(IFormFile file)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = "service-request/audio"
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.Url.ToString();
        }

    }



}
