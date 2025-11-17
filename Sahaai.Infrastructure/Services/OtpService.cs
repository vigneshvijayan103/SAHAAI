using Sahaai.Application.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;


namespace Sahaai.Infrastructure.Services
{
    public class OtpService:IOtpService
    {
        private readonly IDistributedCache _cache;
        public OtpService(IDistributedCache cache)
        {
            _cache = cache;
        }

        //generate and store otp
        public async Task<string> GenerateOtpAsync(string key)
        {

            var otp = new Random().Next(100000, 999999).ToString();


            await _cache.SetStringAsync(
                $"otp:{key}",
                otp,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
                });

            return otp;
        }


        //verify otp
        public async Task<bool> VerifyOtpAsync(string key, string otp)
        {
            var storedOtp = await _cache.GetStringAsync($"otp:{key}");

            if (storedOtp == null)
                return false;

            if (storedOtp == otp)
            {
                await _cache.RemoveAsync($"otp:{key}");
                return true;
            }

            return false;
        }

    }
}
