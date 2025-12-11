using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;

namespace Sahaai.Infrastructure.Repositories
{
    public class ServiceRequestRepository: IServiceRequestRepository
    {
        private readonly AppDbContext _db;      

        public ServiceRequestRepository(AppDbContext db)
        {
            _db = db;
        }

        //Add service request
        public async Task<ServiceRequest> AddAsync(ServiceRequest request)
        {
            await _db.ServiceRequests.AddAsync(request);
            await _db.SaveChangesAsync();
            return request;
        }

        //Get service request by id and userId
        public async Task<ServiceRequest?> GetByIdAndUserIdAsync(int requestId, int userId)
        {
            return await _db.ServiceRequests
                .Where(r => r.UserId == userId) 
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }

        //Get service request by id
        public async Task<ServiceRequest?> GetByIdAsync(int id)
        {
            return await _db.ServiceRequests
                .Include(u => u.User)
                .Include(a => a.Address)
                .Include(s => s.Service)
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        //Update service request
        public async Task UpdateAsync(ServiceRequest request)
        {
            _db.ServiceRequests.Update(request);
            await _db.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }

        //Get all service requests

        public async Task<List<ServiceRequest>> GetByUserIdAsync(int userId)
        {
            return await _db.ServiceRequests
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedOn)
                .ToListAsync();
        }
        //Get service request details by id
        public async Task<ServiceRequest?> GetDetailsByIdAsync(int requestId)
        {
            return await _db.ServiceRequests
                .Include(r => r.Address)
                .FirstOrDefaultAsync(r => r.Id == requestId);
        }


    }
}
