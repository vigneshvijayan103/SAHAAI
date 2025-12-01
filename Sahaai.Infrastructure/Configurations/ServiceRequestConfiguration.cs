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
    public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
    {
        public void Configure(EntityTypeBuilder<ServiceRequest> builder)
        {
           
            builder.ToTable("ServiceRequests");

            builder.HasKey(sr => sr.Id);

          
            builder.Property(sr => sr.UserId)
                   .IsRequired();

            builder.Property(sr => sr.WorkerId)
                   .IsRequired(false);

        
            builder.Property(sr => sr.ServiceId)
                   .IsRequired();

           
            builder.Property(sr => sr.Latitude)
                   .IsRequired()
                   .HasColumnType("float");

            builder.Property(sr => sr.Longitude)
                   .IsRequired()
                   .HasColumnType("float");

            builder.Property(sr => sr.Address)
                   .HasMaxLength(500)
                   .IsRequired(false);

            
            builder.Property(sr => sr.Description)
                   .HasMaxLength(500)
                   .IsRequired(false);

            
            builder.Property(sr => sr.Status)
                   .HasMaxLength(50)
                   .HasDefaultValue("Pending");

            builder.HasIndex(sr => sr.UserId);
            builder.HasIndex(sr => sr.WorkerId);
            builder.HasIndex(sr => sr.ServiceId);
            builder.HasIndex(sr => sr.Status);

           
            builder.HasOne<User>()
                   .WithMany()
                   .HasForeignKey(sr => sr.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<User>()
                   .WithMany()
                   .HasForeignKey(sr => sr.WorkerId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

    

