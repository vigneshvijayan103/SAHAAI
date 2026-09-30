namespace Sahaai.Application.Features.Reviews.DTO
{
    public class CreateWorkerReviewDto
    {
        public int ServiceRequestId { get; set; }
        public int Rating { get; set; } // 1 - 5
        public string? ReviewText { get; set; }
    }
}

