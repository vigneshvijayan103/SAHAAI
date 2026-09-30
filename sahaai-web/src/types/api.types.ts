export interface ApiResponse<T = any> {
  statusCode: number;
  statusMessage: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  errorType?: string;
}

export interface RateLimitResponse {
  status: 429;
  policy: string;
  retryAfter: number;
  message: string;
}

