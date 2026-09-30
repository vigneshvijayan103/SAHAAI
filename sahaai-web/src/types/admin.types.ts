export interface DashboardStatsDto {
  totalUsers: number;
  totalServices: number;
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  pendingRequests: number;
  newUsersThisMonth: number;
  requestsByStatus: Record<string, number>;
  recentRequests: RecentRequestDto[];
}

export interface RecentRequestDto {
  requestId: number;
  title: string;
  status: string;
  userName: string;
  serviceName: string;
  createdOn: string;
}

export interface AdminUserDto {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdOn: string;
  totalRequests: number;
}

export interface AdminServiceRequestDto {
  requestId: number;
  title: string;
  description?: string;
  status: string;
  userName: string;
  userEmail: string;
  serviceName: string;
  addressLine?: string;
  imageUrls?: string[];
  audioUrl?: string;
  assignedWorkerId?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  createdOn: string;
  acceptedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
}

export interface UpdateRequestStatusDto {
  status: string;
}

export interface AdminState {
  stats: DashboardStatsDto | null;
  users: AdminUserDto[];
  requests: AdminServiceRequestDto[];
  selectedUser: AdminUserDto | null;
  selectedRequest: AdminServiceRequestDto | null;
  isLoading: boolean;
  error: string | null;
}

