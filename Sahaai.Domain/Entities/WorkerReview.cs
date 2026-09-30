using System;

namespace Sahaai.Domain.Entities
{
    public class WorkerReview : BaseEntity
    {
        public int ServiceRequestId { get; set; }
        public ServiceRequest ServiceRequest { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int WorkerUserId { get; set; }
        public User WorkerUser { get; set; }

        public int Rating { get; set; } // 1 - 5
        public string? ReviewText { get; set; }
    }
}

