export interface WorkerReviewDto {
  id: number;
  serviceRequestId: number;
  serviceTitle: string;
  userId: number;
  customerName: string;
  customerPhone?: string;
  workerUserId: number;
  workerName: string;
  workerPhone?: string;
  rating: number;
  reviewText?: string;
  createdOn: string;
}

export interface CreateWorkerReviewDto {
  serviceRequestId: number;
  rating: number;
  reviewText?: string;
}

export interface WorkerRatingSummaryDto {
  workerUserId: number;
  workerName: string;
  workerPhone?: string;
  workerPhotoUrl?: string;
  averageRating: number;
  totalReviews: number;
  star5Count: number;
  star4Count: number;
  star3Count: number;
  star2Count: number;
  star1Count: number;
  recentReviews: WorkerReviewDto[];
}

