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
    public class UserAddressConfiguration:IEntityTypeConfiguration<UserAddress>
    {
        public void Configure(EntityTypeBuilder<UserAddress> builder)
        {
            builder.ToTable("UserAddress");

            builder.HasKey(x => x.Id);

           
            builder.HasOne(x => x.User)
                   .WithMany(u => u.Addresses)   
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

           
            builder.Property(x => x.FullAddress)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(x => x.Latitude)
                   .IsRequired();

            builder.Property(x => x.Longitude)
                   .IsRequired();

            builder.Property(x => x.City)
                   .HasMaxLength(100);

            builder.Property(x => x.State)
                   .HasMaxLength(100);

            builder.Property(x => x.Pincode)
                   .HasMaxLength(10);

            builder.Property(x => x.IsDefault)
                   .IsRequired();

           
            builder.HasQueryFilter(x => !x.IsDeleted);
        }
    }
}
