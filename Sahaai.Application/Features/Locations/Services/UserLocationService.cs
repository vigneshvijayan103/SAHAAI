using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;


namespace Sahaai.Application.Features.Locations.Services
{
    public class UserLocationService:IUserLocationService
    {
        private readonly ILocationRepository _repo;
        private readonly HttpClient _httpClient;

        public UserLocationService(ILocationRepository repo)
        {
            _repo = repo;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "SahaaiApp/1.0");
        }

        //Add or update user location
        public async Task<ApiResponse<string>> UpdateUserLocationAsync(int userId, UpdateLocationDto dto)
        {
            string? address = await GetAddressFromCoordinates(dto.Latitude, dto.Longitude);

            // Save latest location
            var latest = new UserLocation
            {
                UserId = userId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Accuracy = dto.Accuracy,
                Address = address,
                UpdatedAt = DateTime.UtcNow
            };

            await _repo.AddOrUpdateLatestLocationAsync(latest);

            // Save location history
            var history = new UserLocationHistory
            {
                UserId = userId,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Accuracy = dto.Accuracy,
                Address = address,
                CreatedOn = DateTime.UtcNow
            };

            await _repo.AddLocationHistoryAsync(history);

            return new ApiResponse<string>(200, "Location updated successfully");
        }

        //get current location
        public async Task<ApiResponse<LocationResponseDto>> GetLatestLocationAsync(int userId)
        {
            var location = await _repo.GetLatestLocationAsync(userId);

            if (location == null)
                return new ApiResponse<LocationResponseDto>(404, "No location found", null);

            var locationDto = new LocationResponseDto
            {
                Latitude = location.Latitude,
                Longitude = location.Longitude,
                Address = location.Address,
                Accuracy = location.Accuracy,
            };

            return new ApiResponse<LocationResponseDto>(200, "Success", locationDto);
        }



        //Get location history
        public async Task<ApiResponse<List<LocationResponseDto>>> GetLocationHistoryAsync(int userId)
        {
            var history = await _repo.GetLocationHistoryAsync(userId);
            var response = history
                .OrderByDescending(h => h.CreatedOn)
                .Select(h => new LocationResponseDto
                {
                    Latitude = h.Latitude,
                    Longitude = h.Longitude,
                    Address = h.Address,
                    Accuracy = h.Accuracy,
           
                })
                .ToList();

            return new ApiResponse<List<LocationResponseDto>>(200, "Success", response);
        }



        //Get nearby workers within radius (in 5 KM)
        public async Task<ApiResponse<List<object>>> GetNearbyWorkersAsync(double latitude, double longitude, double radius)
        {
            var workers = await _repo.GetAllWorkerLocationsAsync();
            var result = new List<object>();

            foreach (var w in workers)
            {
                double distance = CalculateDistance(latitude, longitude, w.Latitude, w.Longitude);

                if (distance <= radius)
                {
                    result.Add(new
                    {
                        w.UserId,
                        w.Latitude,
                        w.Longitude,
                        w.Address,
                        DistanceKm = Math.Round(distance, 2)
                    });
                }
            }

            return new ApiResponse<List<object>>(200, "Success",
                result.OrderBy(x => ((dynamic)x).DistanceKm).ToList());
        }

        //Get address from coordinates using OpenStreetMap Nominatim API
        private async Task<string?> GetAddressFromCoordinates(double latitude, double longitude)
        {
            string url =
                $"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&zoom=18&addressdetails=1";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadFromJsonAsync<OpenStreetResponse>();
            return json?.display_name;
        }

        //Calculate distance between two coordinates using Haversine formula
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            double R = 6371; 
            double dLat = (lat2 - lat1) * Math.PI / 180;
            double dLon = (lon2 - lon1) * Math.PI / 180;

            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

    }

      
}
