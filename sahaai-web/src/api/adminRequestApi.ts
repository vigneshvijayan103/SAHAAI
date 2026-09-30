import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type { AdminServiceRequestDto } from '../types/admin.types';

export const adminRequestApi = {
  getAll: async (): Promise<ApiResponse<AdminServiceRequestDto[]>> => {
    const response = await apiClient.get<ApiResponse<AdminServiceRequestDto[]>>('/AdminServiceRequest');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<AdminServiceRequestDto>> => {
    const response = await apiClient.get<ApiResponse<AdminServiceRequestDto>>(`/AdminServiceRequest/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put<ApiResponse<boolean>>(`/AdminServiceRequest/${id}/status`, {
      status,
    });
    return response.data;
  },

  adminCancel: async (id: number, reason?: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/AdminServiceRequest/${id}/cancel`, {
      data: { reason },
    });
    return response.data;
  },
};

