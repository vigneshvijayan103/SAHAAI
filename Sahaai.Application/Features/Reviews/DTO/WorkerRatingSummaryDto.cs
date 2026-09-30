using System.Collections.Generic;

namespace Sahaai.Application.Features.Reviews.DTO
{
    public class WorkerRatingSummaryDto
    {
        public int WorkerUserId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string? WorkerPhone { get; set; }
        public string? WorkerPhotoUrl { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int Star5Count { get; set; }
        public int Star4Count { get; set; }
        public int Star3Count { get; set; }
        public int Star2Count { get; set; }
        public int Star1Count { get; set; }
        public List<WorkerReviewDto> RecentReviews { get; set; } = new();
    }
}

