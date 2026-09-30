using System;
using System.Collections.Generic;

namespace Sahaai.Application.Features.Admin.DTO
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalServices { get; set; }
        public int TotalRequests { get; set; }
        public int ActiveRequests { get; set; }
        public int CompletedRequests { get; set; }
        public int CancelledRequests { get; set; }
        public int PendingRequests { get; set; }
        public int NewUsersThisMonth { get; set; }
        public Dictionary<string, int> RequestsByStatus { get; set; } = new();
        public List<RecentRequestDto> RecentRequests { get; set; } = new();
    }

    public class RecentRequestDto
    {
        public int RequestId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
    }
}
