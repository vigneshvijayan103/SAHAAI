import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import type {
  AuthState,
  LoginResponseDto,
  UserLoginDto,
  UserRegisterDto,
  VerifyOtpDto,
  ResendOtpRequestDto,
} from '../../types/auth.types';

// Load initial state from localStorage if available
const storedToken = localStorage.getItem('sahaai_token');
const storedUser = localStorage.getItem('sahaai_user');

const initialState: AuthState = {
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  pendingRegistrationUserId: null,
  pendingRegistrationEmail: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (dto: UserLoginDto, { rejectWithValue }) => {
    try {
      const response = await authApi.login(dto);
      if (response.data) {
        localStorage.setItem('sahaai_token', response.data.token);
        localStorage.setItem('sahaai_user', JSON.stringify(response.data));
        return response.data;
      }
      return rejectWithValue('Invalid login response from server');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (dto: UserRegisterDto, { rejectWithValue }) => {
    try {
      const response = await authApi.register(dto);
      if (response.data && response.data.userId > 0) {
        return { userId: response.data.userId, email: dto.email, message: response.statusMessage };
      }
      return rejectWithValue(response.statusMessage || 'Registration failed');
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (dto: VerifyOtpDto, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(dto);
      return response.statusMessage || 'Verified successfully';
    } catch (err: any) {
      return rejectWithValue(err.message || 'OTP verification failed');
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (dto: ResendOtpRequestDto, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOtp(dto);
      return response.statusMessage || 'OTP resent successfully';
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to resend OTP');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.pendingRegistrationUserId = null;
      state.pendingRegistrationEmail = null;
      localStorage.removeItem('sahaai_token');
      localStorage.removeItem('sahaai_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setPendingRegistration: (
      state,
      action: PayloadAction<{ userId: number; email: string }>
    ) => {
      state.pendingRegistrationUserId = action.payload.userId;
      state.pendingRegistrationEmail = action.payload.email;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponseDto>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingRegistrationUserId = action.payload.userId;
        state.pendingRegistrationEmail = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false;
        state.pendingRegistrationUserId = null;
        state.pendingRegistrationEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setPendingRegistration } = authSlice.actions;
export default authSlice.reducer;

