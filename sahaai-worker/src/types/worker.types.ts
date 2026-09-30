export interface ApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
}

export interface WorkerAuthUser {
  userId: number;
  userName: string;
  email: string;
  role: string;
  token: string;
  fullName?: string;
}

export type WorkerStatus = 'Online' | 'OnDuty' | 'Offline';

export interface WorkerProfileDto {
  workerId: number;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  aadhaarNumber: string;
  photoUrl: string;
  isActive: boolean;
  isOnline: boolean;
  status: WorkerStatus;
  currentLatitude: number | null;
  currentLongitude: number | null;
}

export interface WorkerUpdateProfileDto {
  fullName?: string;
  phone?: string;
  photo?: File;
}

export interface WorkerJobDto {
  requestId: number;
  title: string;
  description: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  addressLine: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
  status: 'Pending' | 'Searching' | 'ExpandingRadius' | 'Accepted' | 'InProgress' | 'Completed' | 'Cancelled' | string;
  imageUrls: string[];
  audioUrl: string | null;
  createdOn: string;
  acceptedAt: string | null;
  completedAt: string | null;
  cancellationReason: string | null;
}

export interface WorkerDashboardStatsDto {
  totalAssignedJobs: number;
  completedJobs: number;
  activeJobs: number;
  cancelledJobs: number;
  isOnline: boolean;
  status: WorkerStatus;
  currentLatitude: number | null;
  currentLongitude: number | null;
  activeJob: WorkerJobDto | null;
}

export interface WorkerAvailabilityDto {
  isOnline?: boolean;
  status?: WorkerStatus;
}

export interface WorkerLocationUpdateDto {
  latitude: number;
  longitude: number;
}

export interface CompleteJobDto {
  notes?: string;
}

export interface RejectJobDto {
  reason?: string;
}

