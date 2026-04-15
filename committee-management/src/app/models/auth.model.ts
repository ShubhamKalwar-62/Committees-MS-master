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

export interface ForgotPasswordResetRequest {
  email: string;
  role: 'STUDENT' | 'FACULTY';
  newPassword: string;
}

export interface ForgotPasswordResetResponse {
  email: string;
  role: string;
  mailSent: boolean;
  mailMessage: string;
}

export interface MyCommitteeMembership {
  committeeId?: number;
  committeeName?: string;
  memberRole?: string;
  facultyInchargeName?: string;
}

export interface MyProfileResponse {
  email: string;
  role: string;
  name?: string;
  userId?: number;
  photoDataUrl?: string;
  committeeMemberships?: MyCommitteeMembership[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  email: string;
  role: string;
}

export interface ProfilePhotoResponse {
  photoDataUrl?: string;
}
