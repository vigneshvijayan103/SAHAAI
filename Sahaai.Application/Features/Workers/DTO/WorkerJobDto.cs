using System;
using System.Collections.Generic;

namespace Sahaai.Application.Features.Workers.DTO
{
    public class WorkerJobDto
    {
        public int RequestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string? AddressLine { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double? DistanceKm { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new();
        public string? AudioUrl { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? CancellationReason { get; set; }
    }
}

