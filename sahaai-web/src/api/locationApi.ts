import apiClient from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  AddressResponseDto,
  AddAddressDto,
  UpdateAddressDto,
  ReverseGeocodeResultDto,
  GeocodeResultDto,
} from '../types/location.types';

export const locationApi = {
  getAll: async (): Promise<ApiResponse<AddressResponseDto[]>> => {
    const response = await apiClient.get<ApiResponse<AddressResponseDto[]>>('/UserLocation');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<AddressResponseDto>> => {
    const response = await apiClient.get<ApiResponse<AddressResponseDto>>(`/UserLocation/${id}`);
    return response.data;
  },

  getDefault: async (): Promise<ApiResponse<AddressResponseDto>> => {
    const response = await apiClient.get<ApiResponse<AddressResponseDto>>('/UserLocation/default');
    return response.data;
  },

  addAddress: async (dto: AddAddressDto): Promise<ApiResponse<AddressResponseDto>> => {
    const response = await apiClient.post<ApiResponse<AddressResponseDto>>('/UserLocation/Address', dto);
    return response.data;
  },

  updateAddress: async (id: number, dto: UpdateAddressDto): Promise<ApiResponse<AddressResponseDto>> => {
    const response = await apiClient.put<ApiResponse<AddressResponseDto>>(`/UserLocation/${id}`, dto);
    return response.data;
  },

  deleteAddress: async (id: number): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`/UserLocation/${id}`);
    return response.data;
  },

  reverseGeocode: async (lat: number, lon: number): Promise<ApiResponse<ReverseGeocodeResultDto>> => {
    const response = await apiClient.get<ApiResponse<ReverseGeocodeResultDto>>('/UserLocation/reverse-geocode', {
      params: { lat, lon },
    });
    return response.data;
  },

  geocode: async (params: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }): Promise<ApiResponse<GeocodeResultDto>> => {
    const response = await apiClient.get<ApiResponse<GeocodeResultDto>>('/UserLocation/geocode', {
      params,
    });
    return response.data;
  },
};

export default locationApi;

