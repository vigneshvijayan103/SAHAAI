using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class UserAddressRepository: IUserAddressRepository
    {
        private readonly AppDbContext _db;

        public UserAddressRepository(AppDbContext db) {
            _db = db;
        }


        //get address by id
        public async Task<UserAddress?> GetByIdAsync(int id)
        {
            return await _db.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id);
        }


        //get all addresses by userId
        public async Task<List<UserAddress>> GetByUserIdAsync(int userId)
        {
            return await _db.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ToListAsync();
        }


        //get default address by userId
        public async Task<UserAddress?> GetDefaultAddressAsync(int userId)
        {
            return await _db.UserAddresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .FirstOrDefaultAsync();
        }

        //add new address
        public async Task AddAsync(UserAddress address)
        {
            await _db.UserAddresses.AddAsync(address);
        }

        //update address
        public async Task UpdateAsync(UserAddress address)
        {
              _db.UserAddresses.Update(address);
        }

        //soft delete address
        public async Task SoftDeleteAsync(int id,string role)
        {
            var address = await GetByIdAsync(id);

            if (address != null)
            {   
                address.IsDeleted = true;
                address.DeletedOn = DateTime.UtcNow;
                address.DeletedBy = role;
            }
        }

        //save changes
        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }

    }
}
