using System;

namespace Sahaai.Application.Features.Workers.DTO
{
    public class WorkerProfileDto
    {
        public int WorkerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string AadhaarNumber { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public bool IsActive { get; set; }
        public bool IsOnline { get; set; }
        public string Status { get; set; } = "Offline";
        public double? CurrentLatitude { get; set; }
        public double? CurrentLongitude { get; set; }
    }
}

