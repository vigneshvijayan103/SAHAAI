using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class LocationRepository: ILocationRepository
    {
        private readonly AppDbContext _db;

        public LocationRepository(AppDbContext db)
        {
            _db = db;
        }

        //get latest location
        public async Task<UserLocation?> GetLatestLocationAsync(int userId)
        {
            return await _db.UserLocations
                .FirstOrDefaultAsync(x => x.UserId == userId);
        }


        public async Task AddOrUpdateLatestLocationAsync(UserLocation location)
        {
            var existing = await _db.UserLocations
                .FirstOrDefaultAsync(x => x.UserId == location.UserId);

            if (existing == null)
            {
                await _db.UserLocations.AddAsync(location);
            }
            else
            {
                existing.Latitude = location.Latitude;
                existing.Longitude = location.Longitude;
                existing.Address = location.Address;
                existing.Accuracy = location.Accuracy;
                existing.UpdatedAt = location.UpdatedAt;

                _db.UserLocations.Update(existing);
            }

            await _db.SaveChangesAsync();
        }

        public async Task AddLocationHistoryAsync(UserLocationHistory history)
        {
            await _db.UserLocationHistory.AddAsync(history);
            await _db.SaveChangesAsync();
        }

        public async Task<List<UserLocationHistory>> GetLocationHistoryAsync(int userId)
        {
            return await _db.UserLocationHistory
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedOn)
                .ToListAsync();
        }

        //get all workers Location
        public async Task<List<UserLocation>> GetAllWorkerLocationsAsync()
        {
            return await _db.UserLocations
                .Join(_db.Users,
                      loc => loc.UserId,
                      user => user.Id,
                      (loc, user) => new { loc, user })
                .Where(x => x.user.Role == UserRole.Worker &&
                            x.user.IsActive &&
                            !x.user.IsDeleted)
                .Select(x => x.loc)
                .ToListAsync();
        }



    }

}
