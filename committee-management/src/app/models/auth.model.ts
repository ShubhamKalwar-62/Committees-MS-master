export interface AuthRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  role?: string;
  message?: string;
}

export interface TestEmailRequest {
  email: string;
  name?: string;
}

export interface TestEmailResponse {
  email: string;
  mailSent: boolean;
  mailMessage: string;
}
