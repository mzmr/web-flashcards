export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}
