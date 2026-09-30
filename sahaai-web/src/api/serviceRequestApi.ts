import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  ServiceRequestCreateDto,
  ServiceRequestCreateResponse,
  CancelRequestDto,
  ServiceRequestStatusDto,
  ServiceRequestHistoryDto,
  ServiceRequestDetailsDto,
} from '../types/serviceRequest.types';

export const serviceRequestApi = {
  raiseRequest: async (dto: ServiceRequestCreateDto): Promise<ServiceRequestCreateResponse> => {
    const formData = new FormData();
    formData.append('ServiceId', dto.serviceId.toString());
    formData.append('Title', dto.title);
    if (dto.description) {
      formData.append('Description', dto.description);
    }
    formData.append('AddressId', dto.addressId.toString());

    if (dto.imageFiles && dto.imageFiles.length > 0) {
      dto.imageFiles.forEach((file) => {
        formData.append('ImageFiles', file);
      });
    }

    if (dto.audioFile) {
      formData.append('AudioFile', dto.audioFile, 'voicenote.webm');
    }

    const response = await apiClient.post<any>(
      '/ServiceRequest/raise',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const res = response.data;
    const dataObj = res?.data || res;
    const reqId = Number(
      dataObj?.requestId ||
      dataObj?.RequestId ||
      dataObj?.id ||
      dataObj?.Id ||
      res?.requestId ||
      res?.RequestId ||
      res?.id ||
      res?.Id ||
      0
    );

    return {
      requestId: reqId,
      message: res?.statusMessage || res?.message || 'Service Request Created Successfully',
      status: dataObj?.status || dataObj?.Status || 'Searching',
    };
  },

  cancelRequest: async (id: number, dto: CancelRequestDto = {}): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/ServiceRequest/cancel/${id}`, {
      data: dto,
    });
    return response.data;
  },

  getStatus: async (id: number): Promise<ApiResponse<ServiceRequestStatusDto>> => {
    const response = await apiClient.get<ApiResponse<ServiceRequestStatusDto>>(`/ServiceRequest/status/${id}`);
    return response.data;
  },

  getHistory: async (): Promise<ApiResponse<ServiceRequestHistoryDto[]>> => {
    const response = await apiClient.get<ApiResponse<ServiceRequestHistoryDto[]>>('/ServiceRequest/history');
    return response.data;
  },

  getDetails: async (id: number): Promise<ApiResponse<ServiceRequestDetailsDto>> => {
    const response = await apiClient.get<ApiResponse<ServiceRequestDetailsDto>>(`/ServiceRequest/details/${id}`);
    return response.data;
  },
};

