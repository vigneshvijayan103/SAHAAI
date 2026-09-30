import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  UserRegisterDto,
  UserLoginDto,
  LoginResponseDto,
  VerifyOtpDto,
  ResendOtpRequestDto,
  ForgotPasswordRequestDto,
  VerifyOtpAndResetDto,
} from '../types/auth.types';

export const authApi = {
  register: async (dto: UserRegisterDto): Promise<ApiResponse<{ userId: number }>> => {
    const response = await apiClient.post<ApiResponse<{ userId: number }>>('/UserAuth/register', dto);
    return response.data;
  },

  verifyOtp: async (dto: VerifyOtpDto): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/UserAuth/verify-otp', dto);
    return response.data;
  },

  resendOtp: async (dto: ResendOtpRequestDto): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/UserAuth/resend-otp', dto);
    return response.data;
  },

  login: async (dto: UserLoginDto): Promise<ApiResponse<LoginResponseDto>> => {
    const response = await apiClient.post<ApiResponse<LoginResponseDto>>('/UserAuth/login', dto);
    return response.data;
  },

  sendForgotPasswordOtp: async (dto: ForgotPasswordRequestDto): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/UserAuth/forgot/send-otp', dto);
    return response.data;
  },

  verifyOtpAndResetPassword: async (dto: VerifyOtpAndResetDto): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/UserAuth/forgot/reset-password', dto);
    return response.data;
  },
};

