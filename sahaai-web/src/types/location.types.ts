export interface AddressResponseDto {
  id: number;
  fullAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault: boolean;
}

export interface AddAddressDto {
  fullAddress: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault: boolean;
}

export interface UpdateAddressDto {
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
}

export interface ReverseGeocodeResultDto {
  fullAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  displayName?: string;
}

export interface GeocodeResultDto {
  latitude: number;
  longitude: number;
  displayName?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

