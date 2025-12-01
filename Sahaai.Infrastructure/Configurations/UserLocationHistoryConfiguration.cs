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
    public class UserLocationHistoryConfiguration
    {
        public void Configure(EntityTypeBuilder<UserLocationHistory> builder)
        {
           
            builder.ToTable("UserLocationHistory");

           
            builder.HasKey(ulh => ulh.Id);

           
            builder.HasOne<User>()                           
                   .WithMany()                             
                   .HasForeignKey(ulh => ulh.UserId)
                   .OnDelete(DeleteBehavior.Restrict);     

           
            builder.Property(ulh => ulh.UserId)
                   .IsRequired();

            builder.Property(ulh => ulh.Latitude)
                   .IsRequired();

            builder.Property(ulh => ulh.Longitude)
                   .IsRequired();

            builder.Property(ulh => ulh.Address)
                   .HasMaxLength(500);

            builder.Property(ulh => ulh.Accuracy);

           
            builder.Property(ulh => ulh.CreatedOn)
                   .IsRequired();

            builder.Property(ulh => ulh.IsDeleted)
                   .HasDefaultValue(false);
        }
    }
}
