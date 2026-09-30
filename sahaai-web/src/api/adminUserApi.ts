import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type { AdminUserDto } from '../types/admin.types';

export const adminUserApi = {
  getAll: async (): Promise<ApiResponse<AdminUserDto[]>> => {
    const response = await apiClient.get<ApiResponse<AdminUserDto[]>>('/AdminUser');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<AdminUserDto>> => {
    const response = await apiClient.get<ApiResponse<AdminUserDto>>(`/AdminUser/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put<ApiResponse<boolean>>(`/AdminUser/${id}/toggle-status`);
    return response.data;
  },

  search: async (query: string): Promise<ApiResponse<AdminUserDto[]>> => {
    const response = await apiClient.get<ApiResponse<AdminUserDto[]>>('/AdminUser/search', {
      params: { query },
    });
    return response.data;
  },
};

