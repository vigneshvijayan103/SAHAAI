export interface UserRegisterDto {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginDto {
  userName: string;
  password: string;
}

export interface LoginResponseDto {
  userId: number;
  userName: string;
  email: string;
  role: 'User' | 'Admin' | string;
  token: string;
}

export interface VerifyOtpDto {
  id?: number;
  email?: string;
  otp: string;
}

export interface ResendOtpRequestDto {
  email: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface VerifyOtpAndResetDto {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: LoginResponseDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingRegistrationUserId: number | null;
  pendingRegistrationEmail: string | null;
}

