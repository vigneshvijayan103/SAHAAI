using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Sahaai.Domain.Entities;

namespace Sahaai.Infrastructure.Configurations
{
    public class WorkerReviewConfiguration : IEntityTypeConfiguration<WorkerReview>
    {
        public void Configure(EntityTypeBuilder<WorkerReview> builder)
        {
            builder.ToTable("WorkerReviews");

            builder.HasKey(x => x.Id);

            builder.HasOne(x => x.ServiceRequest)
                .WithMany()
                .HasForeignKey(x => x.ServiceRequestId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.WorkerUser)
                .WithMany()
                .HasForeignKey(x => x.WorkerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(x => x.Rating)
                .IsRequired();

            builder.Property(x => x.ReviewText)
                .HasMaxLength(1000);

            builder.HasIndex(x => x.ServiceRequestId)
                .IsUnique();

            builder.HasIndex(x => x.WorkerUserId);
            builder.HasIndex(x => x.UserId);
        }
    }
}

