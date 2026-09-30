using Microsoft.Extensions.Caching.Memory;
using Sahaai.Application.Common;
using System;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Services
{
    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _cache;

        public OtpService(IMemoryCache cache)
        {
            _cache = cache;
        }

        // generate and store otp
        public Task<string> GenerateOtpAsync(string email, string purpose)
        {
            var otp = new Random().Next(100000, 999999).ToString();
            string cacheKey = $"otp:{purpose.ToLowerInvariant()}:{email.Trim().ToLowerInvariant()}";

            _cache.Set(cacheKey, otp, TimeSpan.FromMinutes(5));

            return Task.FromResult(otp);
        }

        // verify otp
        public Task<bool> VerifyOtpAsync(string email, string purpose, string otp)
        {
            string cacheKey = $"otp:{purpose.ToLowerInvariant()}:{email.Trim().ToLowerInvariant()}";

            if (_cache.TryGetValue(cacheKey, out string? storedOtp) && storedOtp == otp.Trim())
            {
                _cache.Remove(cacheKey);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
    }
}
