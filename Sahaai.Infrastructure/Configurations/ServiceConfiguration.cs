using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sahaai.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Configurations
{
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
           
            builder.ToTable("Services");

            // Primary Key
            builder.HasKey(s => s.Id);

            // ServiceName
            builder.Property(s => s.ServiceName)
                   .IsRequired()
                   .HasMaxLength(150);

            // Description
            builder.Property(s => s.Description)
                   .HasMaxLength(500);

            // Image Url
            builder.Property(s => s.ImageUrl)
                   .HasMaxLength(500);

            // IsActive
            builder.Property(s => s.IsActive)
                   .HasDefaultValue(true);

            // Soft Delete
            builder.Property(s => s.IsDeleted)
                   .HasDefaultValue(false);

           
            builder.HasIndex(s => s.ServiceName);

            builder.HasIndex(s => s.IsActive);

            builder.HasIndex(s => s.IsDeleted);

            
            builder.Property(s => s.CreatedBy)
                   .HasMaxLength(100);

            builder.Property(s => s.ModifiedBy)
                   .HasMaxLength(100);

            builder.Property(s => s.DeletedBy)
                   .HasMaxLength(100);

           
            builder.HasQueryFilter(s => !s.IsDeleted);
        }
    }
}
