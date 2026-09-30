export type ServiceRequestStatus =
  | 'Pending'
  | 'Searching'
  | 'ExpandingRadius'
  | 'Accepted'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'NoWorkersAvailable';

export interface ServiceRequestCreateDto {
  serviceId: number;
  title: string;
  description?: string;
  addressId: number;
  imageFiles?: File[];
  audioFile?: File;
}

export interface ServiceRequestCreateResponse {
  requestId: number;
  message: string;
  status: string;
}

export interface CancelRequestDto {
  reason?: string;
}

export interface ServiceRequestStatusDto {
  requestId: number;
  status: ServiceRequestStatus | string;
  isAssigned: boolean;
  assignedWorkerId?: number;
  acceptedAt?: string;
  searchRadius: number;
  createdOn: string;
}

export interface ServiceRequestHistoryDto {
  requestId: number;
  title: string;
  status: ServiceRequestStatus | string;
  createdOn: string;
  acceptedAt?: string;
  cancelledAt?: string;
  completedAt?: string;
}

export interface ServiceRequestDetailsDto {
  requestId: number;
  title: string;
  description?: string;
  imageUrls?: string[];
  audioUrl?: string;
  status: ServiceRequestStatus | string;
  addressLine: string;
  latitude?: number;
  longitude?: number;
  assignedWorkerId?: number;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  assignedWorkerPhoto?: string;
  workerLatitude?: number;
  workerLongitude?: number;
  createdOn: string;
  acceptedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  completedAt?: string;
}

