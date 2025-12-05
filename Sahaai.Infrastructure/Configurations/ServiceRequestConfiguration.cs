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
    public class ServiceRequestConfiguration: IEntityTypeConfiguration<ServiceRequest>
    {
        public void Configure(EntityTypeBuilder<ServiceRequest> builder)
        {
            builder.ToTable("ServiceRequests");

            builder.HasKey(x => x.Id);

            builder.HasOne(sr => sr.User)
                .WithMany(u => u.ServiceRequests)
                .HasForeignKey(sr => sr.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sr => sr.Service)
                .WithMany(s => s.ServiceRequests)
                .HasForeignKey(sr => sr.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sr => sr.Address)
                .WithMany(a => a.ServiceRequests)
                .HasForeignKey(sr => sr.AddressId)
                .OnDelete(DeleteBehavior.Restrict);

            

            builder.Property(x => x.Title).HasMaxLength(150).IsRequired();
            builder.Property(x => x.Description).HasMaxLength(500);

            builder.Property(x => x.ImageUrls).HasColumnType("nvarchar(max)");
            builder.Property(x => x.AudioUrl).HasColumnType("nvarchar(max)");

            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

            builder.Property(x => x.AcceptedAt).HasColumnType("datetime2");

            builder.HasIndex(x => x.UserId);
            builder.HasIndex(x => x.ServiceId);
            builder.HasIndex(x => x.AddressId);
            builder.HasIndex(x => x.Status);
        }
    }
}

