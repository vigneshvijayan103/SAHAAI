using Microsoft.EntityFrameworkCore;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Repositories
{
    public class ServiceRepository:IServiceRepository
    {
        private readonly AppDbContext _db;

        public ServiceRepository(AppDbContext db)
        {
            _db = db;
        }

        //Add service
        public async Task AddAsync(Service service)
        {
            await _db.Service.AddAsync(service);
        }


        //Get Service By Id
        public async Task<Service?> GetByIdAsync(int id)
        {
            return await _db.Service
                .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        }


        //Get all Service
        public async Task<List<Service>> GetAllAsync()
        {
            return await _db.Service
                .Where(x => !x.IsDeleted)
                .ToListAsync();
        }

        //update service
        public async Task UpdateAsync(Service service)
        {
            _db.Service.Update(service);
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }

    }
}
