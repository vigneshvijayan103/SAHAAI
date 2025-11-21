using Sahaai.Application.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;


namespace Sahaai.Infrastructure.Services
{
    public class OtpService : IOtpService
    {
        private readonly IDistributedCache _cache;
        public OtpService(IDistributedCache cache)
        {
            _cache = cache;
        }

        //generate and store otp
        public async Task<string> GenerateOtpAsync(string email, string purpose)
        {
            var otp = new Random().Next(100000, 999999).ToString();

            
            string redisKey = $"otp:{purpose}:{email}";

            string redisKey = $"otp:{purpose}:{email}";

            await _cache.SetStringAsync(
                redisKey,
                otp,
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
                });

            return otp;
        }



        //verify otp
        public async Task<bool> VerifyOtpAsync(string email, string purpose, string otp)
        {
            string redisKey = $"otp:{purpose}:{email}";

            var storedOtp = await _cache.GetStringAsync(redisKey);

            if (storedOtp == null)
                return false; 

            if (storedOtp == otp)
            {
                await _cache.RemoveAsync(redisKey);
                return true;
            }

            return false; 
        }


    }
}