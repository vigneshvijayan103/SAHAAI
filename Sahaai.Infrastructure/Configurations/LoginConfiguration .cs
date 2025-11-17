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
    public class LoginConfiguration : IEntityTypeConfiguration<Login>
    {
        public void Configure(EntityTypeBuilder<Login> builder)
        {

            builder.ToTable("Login");


            builder.HasKey(l => l.Id);


            builder.Property(l => l.Username)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(l => l.PasswordHash)
                 .IsRequired();

            builder.Property(l => l.PasswordSalt)
                .IsRequired();

            builder.Property(l => l.LastLoginOn)
                .IsRequired(false);


            builder.Property(l => l.LastLoginIp)
                .HasMaxLength(45)
                .IsRequired(false);


            //Releation with User

            builder.HasOne(l => l.User)
                .WithOne(u => u.Login)
                .HasForeignKey<Login>(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            builder.HasIndex(l => l.UserId)
                .IsUnique();


        }

    }
}
