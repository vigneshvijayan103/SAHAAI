export interface ServiceResponseDto {
  id: number;
  serviceName: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CreateServiceDto {
  serviceName: string;
  description?: string;
  image?: File;
}

export interface UpdateServiceDto {
  serviceName?: string;
  description?: string;
  image?: File;
  isActive: boolean;
}

