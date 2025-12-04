using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Interfaces
{
    public interface IUserAddressService
    {
        Task<AddressResponseDto?> GetAddressByIdAsync(int id, int userId);
        Task<List<AddressResponseDto>> GetAddressesAsync(int userId);
        Task<AddressResponseDto?> GetDefaultAddressAsync(int userId);
        Task<AddressResponseDto> AddAddressAsync(int userId, string role, AddAddressDto dto);
        Task<AddressResponseDto?> UpdateAddressAsync(int id, int userId, string role, UpdateAddressDto dto);
        Task<bool> DeleteAddressAsync(int id, string role, int userId);




    }
}
