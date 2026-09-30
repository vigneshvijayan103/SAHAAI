using AutoMapper;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Services
{
    public class UserAddressService : IUserAddressService
    {
        private readonly IUserAddressRepository _repo;
        private readonly IMapper _mapper;
        private readonly HttpClient _nominatimClient;

        public UserAddressService(
            IUserAddressRepository repo,
            IMapper mapper,
            IHttpClientFactory httpClientFactory)
        {
            _repo = repo;
            _mapper = mapper;
            _nominatimClient = httpClientFactory.CreateClient("Nominatim");
        }

        //get address by id and userId
        public async Task<AddressResponseDto?> GetAddressByIdAsync(int id, int userId)
        {
            var address = await _repo.GetByIdAsync(id);

            if (address == null || address.UserId != userId)
                return null;

            return _mapper.Map<AddressResponseDto>(address);
        }

        //get all addresses by userId
        public async Task<List<AddressResponseDto>> GetAddressesAsync(int userId)
        {
            var list = await _repo.GetByUserIdAsync(userId);
            return _mapper.Map<List<AddressResponseDto>>(list);
        }

        //get default address by userId
        public async Task<AddressResponseDto?> GetDefaultAddressAsync(int userId)
        {
            var address = await _repo.GetDefaultAddressAsync(userId);
            return _mapper.Map<AddressResponseDto>(address);
        }

        //add new address
        public async Task<AddressResponseDto> AddAddressAsync(int userId, string role, AddAddressDto dto)
        {
            if (dto.IsDefault)
            {
                var oldDefault = await _repo.GetDefaultAddressAsync(userId);

                if (oldDefault != null)
                {
                    oldDefault.IsDefault = false;
                    oldDefault.ModifiedOn = DateTime.UtcNow;
                    oldDefault.ModifiedBy = role;
                    await _repo.UpdateAsync(oldDefault);
                }
            }

            var address = _mapper.Map<UserAddress>(dto);
            address.UserId = userId;
            address.CreatedOn = DateTime.UtcNow;
            address.CreatedBy = role;

            await _repo.AddAsync(address);
            await _repo.SaveChangesAsync();

            return _mapper.Map<AddressResponseDto>(address);
        }

        //update address
        public async Task<AddressResponseDto?> UpdateAddressAsync(int id, int userId, string role, UpdateAddressDto dto)
        {
            var address = await _repo.GetByIdAsync(id);

            if (address == null || address.UserId != userId)
                return null;

            if (dto.IsDefault.HasValue && dto.IsDefault.Value && !address.IsDefault)
            {
                var oldDefault = await _repo.GetDefaultAddressAsync(userId);

                if (oldDefault != null)
                {
                    oldDefault.IsDefault = false;
                    oldDefault.ModifiedOn = DateTime.UtcNow;
                    await _repo.UpdateAsync(oldDefault);
                }
                address.IsDefault = true;
            }

            _mapper.Map(dto, address);
            address.ModifiedOn = DateTime.UtcNow;
            address.ModifiedBy = role;

            await _repo.UpdateAsync(address);
            await _repo.SaveChangesAsync();

            return _mapper.Map<AddressResponseDto>(address);
        }

        //soft delete address
        public async Task<bool> DeleteAddressAsync(int id, string role, int userId)
        {
            var address = await _repo.GetByIdAsync(id);

            if (address == null || address.UserId != userId)
                return false;

            await _repo.SoftDeleteAsync(id, role);
            await _repo.SaveChangesAsync();

            return true;
        }

        // Reverse Geocode: GPS (Latitude, Longitude) -> Address details
        public async Task<ReverseGeocodeResultDto?> ReverseGeocodeAsync(double latitude, double longitude)
        {
            try
            {
                var latStr = latitude.ToString(CultureInfo.InvariantCulture);
                var lonStr = longitude.ToString(CultureInfo.InvariantCulture);
                var url = $"reverse?format=json&lat={latStr}&lon={lonStr}&zoom=18&addressdetails=1";

                var response = await _nominatimClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                var displayName = root.TryGetProperty("display_name", out var dn) ? dn.GetString() : null;

                string? road = null, suburb = null, city = null, state = null, pincode = null, houseNumber = null, building = null;

                if (root.TryGetProperty("address", out var addr))
                {
                    if (addr.TryGetProperty("house_number", out var hn)) houseNumber = hn.GetString();
                    if (addr.TryGetProperty("building", out var bld)) building = bld.GetString();
                    if (addr.TryGetProperty("amenity", out var am)) building ??= am.GetString();
                    if (addr.TryGetProperty("road", out var rd)) road = rd.GetString();
                    if (addr.TryGetProperty("suburb", out var sb)) suburb = sb.GetString();
                    if (addr.TryGetProperty("neighbourhood", out var nb)) suburb ??= nb.GetString();

                    if (addr.TryGetProperty("city", out var ct)) city = ct.GetString();
                    else if (addr.TryGetProperty("town", out var tw)) city = tw.GetString();
                    else if (addr.TryGetProperty("village", out var vl)) city = vl.GetString();
                    else if (addr.TryGetProperty("county", out var co)) city = co.GetString();
                    else if (addr.TryGetProperty("city_district", out var cd)) city = cd.GetString();

                    if (addr.TryGetProperty("state", out var st)) state = st.GetString();
                    if (addr.TryGetProperty("postcode", out var pc)) pincode = pc.GetString();
                }

                // Construct a clean, meaningful street address
                var streetParts = new List<string>();
                if (!string.IsNullOrWhiteSpace(houseNumber)) streetParts.Add(houseNumber);
                if (!string.IsNullOrWhiteSpace(building)) streetParts.Add(building);
                if (!string.IsNullOrWhiteSpace(road)) streetParts.Add(road);
                if (!string.IsNullOrWhiteSpace(suburb)) streetParts.Add(suburb);

                var streetAddress = streetParts.Count > 0
                    ? string.Join(", ", streetParts)
                    : (displayName?.Split(',').FirstOrDefault() ?? "Current Location");

                return new ReverseGeocodeResultDto
                {
                    FullAddress = streetAddress,
                    City = city,
                    State = state,
                    Pincode = pincode,
                    Latitude = latitude,
                    Longitude = longitude,
                    DisplayName = displayName
                };
            }
            catch
            {
                return null;
            }
        }

        // Forward Geocode: Address details -> (Latitude, Longitude)
        public async Task<GeocodeResultDto?> GeocodeAddressAsync(string? address, string? city, string? state, string? pincode)
        {
            try
            {
                var queryParts = new List<string>();
                if (!string.IsNullOrWhiteSpace(address)) queryParts.Add(address.Trim());
                if (!string.IsNullOrWhiteSpace(city)) queryParts.Add(city.Trim());
                if (!string.IsNullOrWhiteSpace(state)) queryParts.Add(state.Trim());
                if (!string.IsNullOrWhiteSpace(pincode)) queryParts.Add(pincode.Trim());

                if (queryParts.Count == 0) return null;

                var query = Uri.EscapeDataString(string.Join(", ", queryParts));
                var url = $"search?q={query}&format=json&addressdetails=1&limit=1";

                var response = await _nominatimClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return null;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() == 0)
                {
                    // Fallback search using City + Pincode / State if specific street was not matched
                    if (!string.IsNullOrWhiteSpace(city) || !string.IsNullOrWhiteSpace(pincode))
                    {
                        var fallbackParts = new List<string>();
                        if (!string.IsNullOrWhiteSpace(city)) fallbackParts.Add(city.Trim());
                        if (!string.IsNullOrWhiteSpace(state)) fallbackParts.Add(state.Trim());
                        if (!string.IsNullOrWhiteSpace(pincode)) fallbackParts.Add(pincode.Trim());

                        var fallbackQuery = Uri.EscapeDataString(string.Join(", ", fallbackParts));
                        var fallbackUrl = $"search?q={fallbackQuery}&format=json&addressdetails=1&limit=1";
                        var fallbackResp = await _nominatimClient.GetAsync(fallbackUrl);
                        if (fallbackResp.IsSuccessStatusCode)
                        {
                            var fbJson = await fallbackResp.Content.ReadAsStringAsync();
                            using var fbDoc = JsonDocument.Parse(fbJson);
                            if (fbDoc.RootElement.ValueKind == JsonValueKind.Array && fbDoc.RootElement.GetArrayLength() > 0)
                            {
                                return ParseGeocodeElement(fbDoc.RootElement[0]);
                            }
                        }
                    }
                    return null;
                }

                return ParseGeocodeElement(root[0]);
            }
            catch
            {
                return null;
            }
        }

        private static GeocodeResultDto? ParseGeocodeElement(JsonElement element)
        {
            if (!element.TryGetProperty("lat", out var latProp) || !element.TryGetProperty("lon", out var lonProp))
                return null;

            if (!double.TryParse(latProp.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lat) ||
                !double.TryParse(lonProp.GetString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var lon))
                return null;

            string? city = null, state = null, pincode = null;
            if (element.TryGetProperty("address", out var addr))
            {
                if (addr.TryGetProperty("city", out var ct)) city = ct.GetString();
                else if (addr.TryGetProperty("town", out var tw)) city = tw.GetString();
                else if (addr.TryGetProperty("village", out var vl)) city = vl.GetString();

                if (addr.TryGetProperty("state", out var st)) state = st.GetString();
                if (addr.TryGetProperty("postcode", out var pc)) pincode = pc.GetString();
            }

            var displayName = element.TryGetProperty("display_name", out var dn) ? dn.GetString() : null;

            return new GeocodeResultDto
            {
                Latitude = lat,
                Longitude = lon,
                DisplayName = displayName,
                City = city,
                State = state,
                Pincode = pincode
            };
        }
    }
}

