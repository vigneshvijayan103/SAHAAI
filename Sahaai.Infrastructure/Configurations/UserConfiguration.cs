using Microsoft.EntityFrameworkCore;
using Sahaai.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sahaai.Infrastructure.Configurations
{
    public class UserConfiguration: IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
           
            builder.ToTable("Users");

            // Primary key
            builder.HasKey(u => u.Id);

           
            builder.Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.Phone)
                .HasMaxLength(10);

            builder.Property(u => u.Role)
                 .HasConversion<string>()
                 .IsRequired()
                 .HasMaxLength(50);


            builder.Property(u => u.IsActive)
                .HasDefaultValue(true);


            builder.Property(u => u.IsEmailVerified)
                .HasDefaultValue(false);

          
            builder.HasOne(u => u.Login)
                .WithOne(l => l.User)
                .HasForeignKey<Login>(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

          
            builder.HasOne(u => u.WorkerDetails)
                .WithOne(w => w.User)
                .HasForeignKey<WorkerDetails>(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

         
            builder.Property(u => u.CreatedOn)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
