using System;

namespace Sahaai.Application.Features.Reviews.DTO
{
    public class WorkerReviewDto
    {
        public int Id { get; set; }
        public int ServiceRequestId { get; set; }
        public string ServiceTitle { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int WorkerUserId { get; set; }
        public string WorkerName { get; set; } = string.Empty;
        public string? WorkerPhone { get; set; }
        public int Rating { get; set; }
        public string? ReviewText { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}

