import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminDashboardApi } from '../../api/adminDashboardApi';
import { adminUserApi } from '../../api/adminUserApi';
import { adminRequestApi } from '../../api/adminRequestApi';
import type {
  AdminState,
  DashboardStatsDto,
  AdminUserDto,
  AdminServiceRequestDto,
} from '../../types/admin.types';

const initialState: AdminState = {
  stats: null,
  users: [],
  requests: [],
  selectedUser: null,
  selectedRequest: null,
  isLoading: false,
  error: null,
};

// Dashboard
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminDashboardApi.getStats();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch dashboard stats');
    }
  }
);

// Users
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminUserApi.getAll();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch users');
    }
  }
);

export const searchUsers = createAsyncThunk(
  'admin/searchUsers',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await adminUserApi.search(query);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to search users');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      await adminUserApi.toggleStatus(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to toggle user status');
    }
  }
);

// Service Requests
export const fetchAllRequests = createAsyncThunk(
  'admin/fetchAllRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminRequestApi.getAll();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch requests');
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  'admin/fetchRequestById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await adminRequestApi.getById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch request details');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'admin/updateRequestStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      await adminRequestApi.updateStatus(id, status);
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update request status');
    }
  }
);

export const adminCancelRequest = createAsyncThunk(
  'admin/adminCancelRequest',
  async ({ id, reason }: { id: number; reason?: string }, { rejectWithValue }) => {
    try {
      await adminRequestApi.adminCancel(id, reason);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to cancel request');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload as DashboardStatsDto;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload as AdminUserDto[];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(searchUsers.fulfilled, (state, action) => {
      state.users = action.payload as AdminUserDto[];
    });

    builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
      const userId = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.isActive = !user.isActive;
      }
    });

    // Requests
    builder
      .addCase(fetchAllRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload as AdminServiceRequestDto[];
      })
      .addCase(fetchAllRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchRequestById.fulfilled, (state, action) => {
      state.selectedRequest = action.payload as AdminServiceRequestDto;
    });

    builder.addCase(updateRequestStatus.fulfilled, (state, action) => {
      const { id, status } = action.payload;
      const request = state.requests.find((r) => r.requestId === id);
      if (request) {
        request.status = status;
      }
    });

    builder.addCase(adminCancelRequest.fulfilled, (state, action) => {
      const id = action.payload;
      const request = state.requests.find((r) => r.requestId === id);
      if (request) {
        request.status = 'Cancelled';
        request.cancelledBy = 'Admin';
        request.cancelledAt = new Date().toISOString();
      }
    });
  },
});

export const { clearAdminError, setSelectedUser, setSelectedRequest } = adminSlice.actions;
export default adminSlice.reducer;

