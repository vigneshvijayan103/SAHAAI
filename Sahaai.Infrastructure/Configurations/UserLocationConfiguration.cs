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
    public class UserLocationConfiguration: IEntityTypeConfiguration<UserLocation>
    {
        public void Configure(EntityTypeBuilder<UserLocation> builder)
        {
            
            builder.ToTable("UserLocations");

            // Primary Key
            builder.HasKey(ul => ul.UserId);

            // Properties
            builder.Property(ul => ul.Latitude)
                .IsRequired();

            builder.Property(ul => ul.Longitude)
                .IsRequired();

            builder.Property(ul => ul.Address)
                .HasMaxLength(500);

            builder.Property(ul => ul.Accuracy);

            builder.Property(ul => ul.UpdatedAt)
                .IsRequired();

         
            builder.HasOne<User>()            
                   .WithOne()              
                   .HasForeignKey<UserLocation>(ul => ul.UserId)
                   .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
