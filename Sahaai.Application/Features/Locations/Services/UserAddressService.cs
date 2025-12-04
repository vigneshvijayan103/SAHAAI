using AutoMapper;
using Sahaai.Application.Features.Locations.DTO;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Locations.Services
{
    public class UserAddressService:IUserAddressService
    {
        private readonly IUserAddressRepository _repo;
        private readonly IMapper _mapper;


        public UserAddressService(IUserAddressRepository repo,
                                      IMapper mapper         )
        {
            _repo = repo;
            _mapper = mapper;
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
        public async Task<AddressResponseDto> AddAddressAsync(int userId,string role, AddAddressDto dto)
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

        public async Task<AddressResponseDto?> UpdateAddressAsync( int id,int userId,string role, UpdateAddressDto dto)
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
        public async Task<bool> DeleteAddressAsync(int id,string role, int userId)
        {
            var address = await _repo.GetByIdAsync(id);

            if (address == null || address.UserId != userId)
                return false;

            await _repo.SoftDeleteAsync(id,role);
            await _repo.SaveChangesAsync();

            return true;
        }

    }
}
