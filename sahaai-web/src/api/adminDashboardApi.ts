import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type { DashboardStatsDto } from '../types/admin.types';

export const adminDashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStatsDto>> => {
    const response = await apiClient.get<ApiResponse<DashboardStatsDto>>('/AdminDashboard/stats');
    return response.data;
  },
};

