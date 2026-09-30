import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  UserProfileDto,
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '../types/user.types';

export const profileApi = {
  getProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.get<ApiResponse<UserProfileDto>>('/UserProfile/profile');
    return response.data;
  },

  updateProfile: async (dto: UpdateUserProfileDto): Promise<ApiResponse<UpdateUserProfileDto>> => {
    const response = await apiClient.put<ApiResponse<UpdateUserProfileDto>>('/UserProfile/profile', dto);
    return response.data;
  },

  changePassword: async (dto: ChangePasswordDto): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.put<ApiResponse<boolean>>('/UserProfile/change-password', dto);
    return response.data;
  },
};

