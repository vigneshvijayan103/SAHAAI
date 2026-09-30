using System;
using System.Collections.Generic;

namespace Sahaai.Application.Features.Admin.DTO
{
    public class AdminServiceRequestDto
    {
        public int RequestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string? AddressLine { get; set; }
        public List<string>? ImageUrls { get; set; }
        public string? AudioUrl { get; set; }
        public int? AssignedWorkerId { get; set; }
        public string? CancellationReason { get; set; }
        public string? CancelledBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class UpdateRequestStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
