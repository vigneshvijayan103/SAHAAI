//using AutoMapper;
//using Sahaai.Application.Common;
//using Sahaai.Application.Features.Locations.DTO;
//using Sahaai.Application.Features.Locations.Interfaces;
//using Sahaai.Domain.Entities;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Net.Http;
//using System.Net.Http.Json;
//using System.Text;
//using System.Threading.Tasks;


//namespace Sahaai.Application.Features.Locations.Services
//{
//    public class UserLocationService : IUserLocationService
//    {
//        private readonly IUserAddressRepository _repo;
//        private readonly HttpClient _httpClient;
//        private readonly IMapper _mapper;

//        public UserLocationService(
//            IUserAddressRepository repo,
//            IMapper mapper,
//            IHttpClientFactory httpClientFactory)
//        {

//            _repo = repo;
//            _mapper = mapper;
//            _httpClient = httpClientFactory.CreateClient("Nominatim");
//        }



//        //Add or update user location
//        public async Task<string> UpdateUserLocationAsync(int userId, string role, UpdateLocationDto dto)
//        {


//            // Save latest location
//            var latest = _mapper.Map<UserLocation>(dto);
//            latest.UserId = userId;

//            await _repo.AddOrUpdateLatestLocationAsync(latest);

//            // Save location history
//            var history = _mapper.Map<UserLocationHistory>(dto);
//            history.UserId = userId;
//            history.CreatedBy = role;

//            await _repo.AddLocationHistoryAsync(history);

//            return "Location updated successfully";
//        }



//        //get current location
//        public async Task<LocationResponseDto?> GetLatestLocationAsync(int userId)
//        {
//            var location = await _repo.GetLatestLocationAsync(userId);

//            if (location == null)
//                return null;

//            return _mapper.Map<LocationResponseDto>(location);
//        }



//        //Get location history
//        public async Task<List<LocationResponseDto>> GetLocationHistoryAsync(int userId)
//        {
//            var history = await _repo.GetLocationHistoryAsync(userId);

//            return history
//                .OrderByDescending(h => h.CreatedOn)
//                .Select(h => _mapper.Map<LocationResponseDto>(h))
//                .ToList();
//        }






//        //Get address from coordinates using OpenStreetMap Nominatim API
//        private async Task<string?> GetAddressFromCoordinates(double latitude, double longitude)
//        {
//            string url =
//                $"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1";

//            var response = await _httpClient.GetAsync(url);
//            if (!response.IsSuccessStatusCode)
//                return null;

//            var json = await response.Content.ReadFromJsonAsync<OpenStreetResponse>();
//            return json?.display_name;
//        }



//    }


//}
