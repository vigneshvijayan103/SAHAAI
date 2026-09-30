import axios from 'axios';
import type {
  ApiResponse,
  WorkerAuthUser,
  WorkerProfileDto,
  WorkerDashboardStatsDto,
  WorkerJobDto,
  WorkerAvailabilityDto,
  WorkerStatus,
  WorkerLocationUpdateDto,
  CompleteJobDto,
  RejectJobDto,
} from '../types/worker.types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Worker Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahaai_worker_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for friendly errors and 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.statusMessage || error.response?.data?.message || error.message || 'Request failed';
    if (error.response?.status === 401) {
      localStorage.removeItem('sahaai_worker_token');
      localStorage.removeItem('sahaai_worker_user');
      if (window.location.pathname !== '/login') {
        const isDeactivated = msg?.toLowerCase().includes('deactivated');
        window.location.href = isDeactivated ? '/login?deactivated=true' : '/login?expired=true';
      }
    }
    return Promise.reject(new Error(msg));
  }
);

export const workerApi = {
  // Authentication
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<WorkerAuthUser>> => {
    const res = await apiClient.post<ApiResponse<WorkerAuthUser>>('/WorkerAuth/login', credentials);
    return res.data;
  },

  register: async (formData: FormData): Promise<ApiResponse<{ userId: number; workerId: number; message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ userId: number; workerId: number; message: string }>>(
      '/WorkerAuth/register',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  // Profile & Status
  getProfile: async (): Promise<ApiResponse<WorkerProfileDto>> => {
    const res = await apiClient.get<ApiResponse<WorkerProfileDto>>('/WorkerProfile');
    return res.data;
  },

  updateProfile: async (formData: FormData): Promise<ApiResponse<WorkerProfileDto>> => {
    const res = await apiClient.put<ApiResponse<WorkerProfileDto>>('/WorkerProfile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateAvailability: async (dto: WorkerAvailabilityDto): Promise<ApiResponse<{ status: WorkerStatus; isOnline: boolean }>> => {
    const res = await apiClient.put<ApiResponse<{ status: WorkerStatus; isOnline: boolean }>>('/WorkerProfile/availability', dto);
    return res.data;
  },

  updateLocation: async (dto: WorkerLocationUpdateDto): Promise<ApiResponse<{ latitude: number; longitude: number }>> => {
    const res = await apiClient.post<ApiResponse<{ latitude: number; longitude: number }>>('/WorkerProfile/location', dto);
    return res.data;
  },

  getDashboard: async (): Promise<ApiResponse<WorkerDashboardStatsDto>> => {
    const res = await apiClient.get<ApiResponse<WorkerDashboardStatsDto>>('/WorkerProfile/dashboard');
    return res.data;
  },

  // Service Requests / Jobs
  getAvailableJobs: async (lat?: number, lng?: number, radiusKm?: number): Promise<ApiResponse<WorkerJobDto[]>> => {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lng !== undefined) params.append('lng', lng.toString());
    if (radiusKm !== undefined) params.append('radius', radiusKm.toString());

    const res = await apiClient.get<ApiResponse<WorkerJobDto[]>>(`/WorkerServiceRequest/available?${params.toString()}`);
    return res.data;
  },

  getCurrentJob: async (): Promise<ApiResponse<WorkerJobDto | null>> => {
    const res = await apiClient.get<ApiResponse<WorkerJobDto | null>>('/WorkerServiceRequest/current');
    return res.data;
  },

  getJobDetails: async (requestId: number): Promise<ApiResponse<WorkerJobDto>> => {
    const res = await apiClient.get<ApiResponse<WorkerJobDto>>(`/WorkerServiceRequest/${requestId}`);
    return res.data;
  },

  acceptJob: async (requestId: number): Promise<ApiResponse<{ requestId: number }>> => {
    const res = await apiClient.post<ApiResponse<{ requestId: number }>>(`/WorkerServiceRequest/${requestId}/accept`);
    return res.data;
  },

  startJob: async (requestId: number, lat?: number, lng?: number): Promise<ApiResponse<{ requestId: number }>> => {
    const params = new URLSearchParams();
    if (lat !== undefined && lat !== null) params.append('lat', lat.toString());
    if (lng !== undefined && lng !== null) params.append('lng', lng.toString());
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.put<ApiResponse<{ requestId: number }>>(`/WorkerServiceRequest/${requestId}/start${query}`);
    return res.data;
  },

  completeJob: async (requestId: number, dto: CompleteJobDto): Promise<ApiResponse<{ requestId: number }>> => {
    const res = await apiClient.put<ApiResponse<{ requestId: number }>>(`/WorkerServiceRequest/${requestId}/complete`, dto);
    return res.data;
  },

  rejectJob: async (requestId: number, dto: RejectJobDto): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>(`/WorkerServiceRequest/${requestId}/reject`, dto);
    return res.data;
  },

  getJobHistory: async (): Promise<ApiResponse<WorkerJobDto[]>> => {
    const res = await apiClient.get<ApiResponse<WorkerJobDto[]>>('/WorkerServiceRequest/history');
    return res.data;
  },
};

