import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminServiceApi } from '../../api/adminServiceApi';
import type {
  ServiceResponseDto,
  CreateServiceDto,
  UpdateServiceDto,
} from '../../types/service.types';

interface ServicesState {
  services: ServiceResponseDto[];
  selectedService: ServiceResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  selectedService: null,
  isLoading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminServiceApi.getAll();
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch services');
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (dto: CreateServiceDto, { rejectWithValue }) => {
    try {
      const response = await adminServiceApi.create(dto);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, dto }: { id: number; dto: UpdateServiceDto }, { rejectWithValue }) => {
    try {
      const response = await adminServiceApi.update(id, dto);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminServiceApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete service');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    selectService: (state, action: PayloadAction<ServiceResponseDto | null>) => {
      state.selectedService = action.payload;
    },
    selectServiceById: (state, action: PayloadAction<number>) => {
      state.selectedService = state.services.find((s) => s.id === action.payload) || null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state) => {
        state.isLoading = false;
      });

    // Create
    builder.addCase(createService.fulfilled, (state, action) => {
      if (action.payload) {
        state.services.unshift(action.payload);
      }
    });

    // Update
    builder.addCase(updateService.fulfilled, (state, action) => {
      if (action.payload) {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      }
    });

    // Delete
    builder.addCase(deleteService.fulfilled, (state, action) => {
      state.services = state.services.filter((s) => s.id !== action.payload);
    });
  },
});

export const { selectService, selectServiceById } = serviceSlice.actions;
export default serviceSlice.reducer;
