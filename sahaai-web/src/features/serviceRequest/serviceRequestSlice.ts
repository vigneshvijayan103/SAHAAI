import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { serviceRequestApi } from '../../api/serviceRequestApi';
import type {
  ServiceRequestCreateDto,
  ServiceRequestCreateResponse,
  ServiceRequestStatusDto,
  ServiceRequestHistoryDto,
  ServiceRequestDetailsDto,
  CancelRequestDto,
} from '../../types/serviceRequest.types';

interface ServiceRequestState {
  currentRequest: ServiceRequestCreateResponse | null;
  currentDetails: ServiceRequestDetailsDto | null;
  currentStatus: ServiceRequestStatusDto | null;
  history: ServiceRequestHistoryDto[];
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServiceRequestState = {
  currentRequest: null,
  currentDetails: null,
  currentStatus: null,
  history: [],
  isSubmitting: false,
  isLoading: false,
  error: null,
};

export const createServiceRequest = createAsyncThunk(
  'serviceRequest/create',
  async (dto: ServiceRequestCreateDto, { rejectWithValue }) => {
    try {
      const response = await serviceRequestApi.raiseRequest(dto);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to raise service request');
    }
  }
);

export const fetchRequestStatus = createAsyncThunk(
  'serviceRequest/fetchStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceRequestApi.getStatus(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch status');
    }
  }
);

export const fetchRequestDetails = createAsyncThunk(
  'serviceRequest/fetchDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await serviceRequestApi.getDetails(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch request details');
    }
  }
);

export const fetchRequestHistory = createAsyncThunk(
  'serviceRequest/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceRequestApi.getHistory();
      return Array.isArray(response.data) ? response.data : [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch request history');
    }
  }
);

export const cancelServiceRequest = createAsyncThunk(
  'serviceRequest/cancel',
  async ({ id, dto }: { id: number; dto?: CancelRequestDto }, { rejectWithValue }) => {
    try {
      const response = await serviceRequestApi.cancelRequest(id, dto);
      return { id, message: response.statusMessage };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to cancel request');
    }
  }
);

const serviceRequestSlice = createSlice({
  name: 'serviceRequest',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
      state.currentDetails = null;
      state.currentStatus = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    workerAccepted: (
      state,
      action: PayloadAction<{
        requestId: number;
        workerId: number;
        workerName: string;
        workerPhone?: string;
        workerPhoto?: string;
        workerLatitude?: number;
        workerLongitude?: number;
        status?: string;
      }>
    ) => {
      const payload = action.payload;
      if (state.currentDetails && state.currentDetails.requestId === payload.requestId) {
        state.currentDetails.status = payload.status || 'Accepted';
        state.currentDetails.assignedWorkerId = payload.workerId;
        state.currentDetails.assignedWorkerName = payload.workerName;
        state.currentDetails.assignedWorkerPhone = payload.workerPhone;
        state.currentDetails.assignedWorkerPhoto = payload.workerPhoto;
        if (payload.workerLatitude !== undefined) {
          state.currentDetails.workerLatitude = payload.workerLatitude;
        }
        if (payload.workerLongitude !== undefined) {
          state.currentDetails.workerLongitude = payload.workerLongitude;
        }
      }
      if (state.currentStatus && state.currentStatus.requestId === payload.requestId) {
        state.currentStatus.status = payload.status || 'Accepted';
        state.currentStatus.isAssigned = true;
        state.currentStatus.assignedWorkerId = payload.workerId;
      }
    },
    workerLocationUpdated: (
      state,
      action: PayloadAction<{
        requestId: number;
        workerId?: number;
        latitude: number;
        longitude: number;
      }>
    ) => {
      const payload = action.payload;
      if (state.currentDetails && state.currentDetails.requestId === payload.requestId) {
        state.currentDetails.workerLatitude = payload.latitude;
        state.currentDetails.workerLongitude = payload.longitude;
      }
    },
    requestStatusUpdated: (
      state,
      action: PayloadAction<{
        requestId: number;
        status: string;
      }>
    ) => {
      const { requestId, status } = action.payload;
      if (state.currentDetails && state.currentDetails.requestId === requestId) {
        state.currentDetails.status = status;
      }
      if (state.currentStatus && state.currentStatus.requestId === requestId) {
        state.currentStatus.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createServiceRequest.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createServiceRequest.fulfilled, (state, action: PayloadAction<ServiceRequestCreateResponse>) => {
        state.isSubmitting = false;
        state.currentRequest = action.payload;
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });

    // Status
    builder.addCase(fetchRequestStatus.fulfilled, (state, action) => {
      state.currentStatus = action.payload;
      if (state.currentDetails && action.payload) {
        state.currentDetails.status = action.payload.status;
        state.currentDetails.assignedWorkerId = action.payload.assignedWorkerId;
        state.currentDetails.acceptedAt = action.payload.acceptedAt;
      }
    });

    // Details
    builder
      .addCase(fetchRequestDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDetails = action.payload;
      })
      .addCase(fetchRequestDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // History
    builder
      .addCase(fetchRequestHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequestHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchRequestHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel
    builder.addCase(cancelServiceRequest.fulfilled, (state) => {
      if (state.currentDetails) {
        state.currentDetails.status = 'Cancelled';
      }
      if (state.currentStatus) {
        state.currentStatus.status = 'Cancelled';
      }
    });
  },
});

export const {
  clearCurrentRequest,
  clearError,
  workerAccepted,
  workerLocationUpdated,
  requestStatusUpdated,
} = serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;

