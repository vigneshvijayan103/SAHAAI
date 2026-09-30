import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  ServiceResponseDto,
  CreateServiceDto,
  UpdateServiceDto,
} from '../types/service.types';

export const adminServiceApi = {
  getAll: async (): Promise<ApiResponse<ServiceResponseDto[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceResponseDto[]>>('/AdminServices');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ServiceResponseDto>> => {
    const response = await apiClient.get<ApiResponse<ServiceResponseDto>>(`/AdminServices/${id}`);
    return response.data;
  },

  create: async (dto: CreateServiceDto): Promise<ApiResponse<ServiceResponseDto>> => {
    const formData = new FormData();
    formData.append('ServiceName', dto.serviceName);
    if (dto.description) {
      formData.append('Description', dto.description);
    }
    if (dto.image) {
      formData.append('Image', dto.image);
    }

    const response = await apiClient.post<ApiResponse<ServiceResponseDto>>('/AdminServices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, dto: UpdateServiceDto): Promise<ApiResponse<ServiceResponseDto>> => {
    const formData = new FormData();
    if (dto.serviceName) {
      formData.append('ServiceName', dto.serviceName);
    }
    if (dto.description) {
      formData.append('Description', dto.description);
    }
    if (dto.image) {
      formData.append('Image', dto.image);
    }
    formData.append('IsActive', dto.isActive.toString());

    const response = await apiClient.put<ApiResponse<ServiceResponseDto>>(`/AdminServices/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/AdminServices/${id}`);
    return response.data;
  },
};

