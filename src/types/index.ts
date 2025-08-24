export interface Quote {
  message: string;
  author: string;
  authorProfile: string;
  id?: string;
  date?: string;
}

export interface QuoteHistory {
  date: string;
  quoteId: string;
  message: string;
  author: string;
  authorProfile: string;
  timestamp: number;
}

export interface CacheInfo {
  size: number;
  lastCleared: number;
  entries: string[];
}

export interface ApiResponse {
  message: string;
  author: string;
  authorProfile: string;
  timestamp?: string;
  fallback?: boolean;
}

export const ErrorType = {
  NETWORK_ERROR: 'network_error',
  API_UNAVAILABLE: 'api_unavailable',
  RATE_LIMIT: 'rate_limit',
  INVALID_RESPONSE: 'invalid_response',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  retryable: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: AppError | null;
}