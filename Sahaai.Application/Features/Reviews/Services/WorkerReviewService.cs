using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Application.Features.Reviews.DTO;
using Sahaai.Application.Features.Reviews.Interfaces;
using Sahaai.Application.Features.Workers.Interfaces;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sahaai.Application.Features.Reviews.Services
{
    public class WorkerReviewService : IWorkerReviewService
    {
        private readonly IWorkerReviewRepository _reviewRepo;
        private readonly IServiceRequestRepository _requestRepo;
        private readonly IWorkerRepository _workerRepo;

        public WorkerReviewService(
            IWorkerReviewRepository reviewRepo,
            IServiceRequestRepository requestRepo,
            IWorkerRepository workerRepo)
        {
            _reviewRepo = reviewRepo;
            _requestRepo = requestRepo;
            _workerRepo = workerRepo;
        }

        public async Task<WorkerReviewDto> CreateReviewAsync(int userId, CreateWorkerReviewDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new ArgumentException("Rating must be between 1 and 5.");
            }

            var request = await _requestRepo.GetByIdAsync(dto.ServiceRequestId);
            if (request == null)
            {
                throw new KeyNotFoundException($"Service request with ID {dto.ServiceRequestId} was not found.");
            }

            if (request.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to review this service request.");
            }

            if (request.Status != ServiceRequestStatus.Completed)
            {
                throw new InvalidOperationException("Reviews can only be submitted for completed service requests.");
            }

            if (!request.AsssignWorkerId.HasValue || request.AsssignWorkerId.Value <= 0)
            {
                throw new InvalidOperationException("No worker was assigned to this service request.");
            }

            var existingReview = await _reviewRepo.GetByServiceRequestIdAsync(dto.ServiceRequestId);
            if (existingReview != null)
            {
                throw new InvalidOperationException("A review has already been submitted for this service request.");
            }

            var review = new WorkerReview
            {
                ServiceRequestId = request.Id,
                UserId = userId,
                WorkerUserId = request.AsssignWorkerId.Value,
                Rating = dto.Rating,
                ReviewText = dto.ReviewText?.Trim(),
                CreatedBy = userId.ToString(),
                CreatedOn = DateTime.UtcNow
            };

            await _reviewRepo.AddAsync(review);

            // Reload review with navigation properties
            var savedReview = await _reviewRepo.GetByIdAsync(review.Id);
            return MapToDto(savedReview ?? review, request);
        }

        public async Task<WorkerReviewDto?> GetReviewByRequestIdAsync(int requestId, int userId)
        {
            var review = await _reviewRepo.GetByServiceRequestIdAsync(requestId);
            if (review == null)
            {
                return null;
            }

            if (review.UserId != userId)
            {
                throw new UnauthorizedAccessException("You are not authorized to view this review.");
            }

            return MapToDto(review);
        }

        public async Task<List<WorkerReviewDto>> GetAllReviewsForAdminAsync(int? workerUserId = null, int? minRating = null, int? maxRating = null)
        {
            var reviews = await _reviewRepo.GetAllAsync(workerUserId, minRating, maxRating);
            return reviews.Select(r => MapToDto(r)).ToList();
        }

        public async Task<List<WorkerRatingSummaryDto>> GetWorkerRatingSummariesAsync()
        {
            var allReviews = await _reviewRepo.GetAllAsync();
            var grouped = allReviews.GroupBy(r => r.WorkerUserId);

            var summaries = new List<WorkerRatingSummaryDto>();

            foreach (var group in grouped)
            {
                var workerUserId = group.Key;
                var workerDetails = await _workerRepo.GetByUserIdAsync(workerUserId);
                var first = group.First();

                var reviewsList = group.ToList();
                var count = reviewsList.Count;
                var avg = count > 0 ? Math.Round(reviewsList.Average(r => r.Rating), 1) : 0;

                summaries.Add(new WorkerRatingSummaryDto
                {
                    WorkerUserId = workerUserId,
                    WorkerName = first.WorkerUser?.FullName ?? workerDetails?.User?.FullName ?? $"Worker #{workerUserId}",
                    WorkerPhone = first.WorkerUser?.Phone ?? workerDetails?.User?.Phone,
                    WorkerPhotoUrl = workerDetails?.PhotoUrl,
                    AverageRating = avg,
                    TotalReviews = count,
                    Star5Count = reviewsList.Count(r => r.Rating == 5),
                    Star4Count = reviewsList.Count(r => r.Rating == 4),
                    Star3Count = reviewsList.Count(r => r.Rating == 3),
                    Star2Count = reviewsList.Count(r => r.Rating == 2),
                    Star1Count = reviewsList.Count(r => r.Rating == 1),
                    RecentReviews = reviewsList.Take(3).Select(r => MapToDto(r)).ToList()
                });
            }

            return summaries.OrderByDescending(s => s.AverageRating).ThenByDescending(s => s.TotalReviews).ToList();
        }

        public async Task<WorkerRatingSummaryDto?> GetWorkerRatingSummaryAsync(int workerUserId)
        {
            var reviews = await _reviewRepo.GetByWorkerUserIdAsync(workerUserId);
            var workerDetails = await _workerRepo.GetByUserIdAsync(workerUserId);

            if (reviews.Count == 0 && workerDetails == null)
            {
                return null;
            }

            var count = reviews.Count;
            var avg = count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0;

            return new WorkerRatingSummaryDto
            {
                WorkerUserId = workerUserId,
                WorkerName = workerDetails?.User?.FullName ?? reviews.FirstOrDefault()?.WorkerUser?.FullName ?? $"Worker #{workerUserId}",
                WorkerPhone = workerDetails?.User?.Phone ?? reviews.FirstOrDefault()?.WorkerUser?.Phone,
                WorkerPhotoUrl = workerDetails?.PhotoUrl,
                AverageRating = avg,
                TotalReviews = count,
                Star5Count = reviews.Count(r => r.Rating == 5),
                Star4Count = reviews.Count(r => r.Rating == 4),
                Star3Count = reviews.Count(r => r.Rating == 3),
                Star2Count = reviews.Count(r => r.Rating == 2),
                Star1Count = reviews.Count(r => r.Rating == 1),
                RecentReviews = reviews.Take(5).Select(r => MapToDto(r)).ToList()
            };
        }

        private static WorkerReviewDto MapToDto(WorkerReview review, ServiceRequest? request = null)
        {
            return new WorkerReviewDto
            {
                Id = review.Id,
                ServiceRequestId = review.ServiceRequestId,
                ServiceTitle = review.ServiceRequest?.Title ?? request?.Title ?? "Service Request",
                UserId = review.UserId,
                CustomerName = review.User?.FullName ?? "Customer",
                CustomerPhone = review.User?.Phone,
                WorkerUserId = review.WorkerUserId,
                WorkerName = review.WorkerUser?.FullName ?? "Worker",
                WorkerPhone = review.WorkerUser?.Phone,
                Rating = review.Rating,
                ReviewText = review.ReviewText,
                CreatedOn = review.CreatedOn
            };
        }
    }
}

