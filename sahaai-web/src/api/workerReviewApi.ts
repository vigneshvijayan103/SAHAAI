import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type { CreateWorkerReviewDto, WorkerReviewDto, WorkerRatingSummaryDto } from '../types/review.types';

export const workerReviewApi = {
  // Customer: Submit review for a completed service request
  async submitReview(data: CreateWorkerReviewDto): Promise<WorkerReviewDto> {
    const response = await apiClient.post<ApiResponse<WorkerReviewDto>>('/WorkerReview', data);
    return response.data.data;
  },

  // Customer: Get review for a specific request
  async getReviewByRequestId(requestId: number): Promise<WorkerReviewDto | null> {
    try {
      const response = await apiClient.get<ApiResponse<WorkerReviewDto>>(`/WorkerReview/request/${requestId}`);
      return response.data.data;
    } catch (err: any) {
      // 404 means no review has been submitted yet
      return null;
    }
  },

  // Admin: Get all reviews with optional filters
  async getAllReviews(params?: {
    workerUserId?: number;
    minRating?: number;
    maxRating?: number;
  }): Promise<WorkerReviewDto[]> {
    const response = await apiClient.get<ApiResponse<WorkerReviewDto[]>>('/AdminWorkerReview', {
      params,
    });
    return response.data.data || [];
  },

  // Admin: Get aggregated ratings per worker
  async getWorkerRatingSummaries(): Promise<WorkerRatingSummaryDto[]> {
    const response = await apiClient.get<ApiResponse<WorkerRatingSummaryDto[]>>('/AdminWorkerReview/summaries');
    return response.data.data || [];
  },

  // Admin: Get single worker rating summary
  async getWorkerSummary(workerUserId: number): Promise<WorkerRatingSummaryDto> {
    const response = await apiClient.get<ApiResponse<WorkerRatingSummaryDto>>(`/AdminWorkerReview/worker/${workerUserId}`);
    return response.data.data;
  },
};

export default workerReviewApi;

