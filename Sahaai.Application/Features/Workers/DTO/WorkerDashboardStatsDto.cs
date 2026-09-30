namespace Sahaai.Application.Features.Workers.DTO
{
    public class WorkerDashboardStatsDto
    {
        public int TotalAssignedJobs { get; set; }
        public int CompletedJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int CancelledJobs { get; set; }
        public bool IsOnline { get; set; }
        public string Status { get; set; } = "Offline";
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
        public WorkerJobDto? ActiveJob { get; set; }
    }
}

