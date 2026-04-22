import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse, AuthRequest, AuthResponse, ChangePasswordRequest, ChangePasswordResponse, ForgotPasswordResetRequest, ForgotPasswordResetResponse, MyProfileResponse, ProfilePhotoResponse, RegisterRequest, TestEmailRequest, TestEmailResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly loginApiUrl = 'http://localhost:8080/api/login';
  private readonly roleKey = 'role';
  private readonly tokenKey = 'token';

  constructor(private http: HttpClient) {}

  login(payload: AuthRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<{ token: string; email?: string; role?: string }>>(`${this.apiUrl}/login`, payload)
      .pipe(
        map((res) => {
          const data = res?.data;
          return {
            token: data?.token || '',
            email: data?.email,
            role: data?.role,
            message: res?.message
          } as AuthResponse;
        }),
        tap((res) => {
          if (!res?.token) {
            return;
          }

          localStorage.setItem(this.tokenKey, res.token);
          const roleFromPayload = this.normalizeRole(res.role || this.extractRoleFromJwt(res.token));
          if (roleFromPayload) {
            localStorage.setItem(this.roleKey, roleFromPayload);
          }
        })
      );
  }

  register(payload: RegisterRequest): Observable<ApiResponse<{ email?: string; role?: string }>> {
    return this.http.post<ApiResponse<{ email?: string; role?: string }>>(`${this.apiUrl}/register`, payload);
  }

  sendTestEmail(payload: TestEmailRequest): Observable<ApiResponse<TestEmailResponse>> {
    return this.http.post<ApiResponse<TestEmailResponse>>(`${this.apiUrl}/test-email`, payload);
  }

  resetForgotPasswordForUser(payload: ForgotPasswordResetRequest): Observable<ApiResponse<ForgotPasswordResetResponse>> {
    return this.http.post<ApiResponse<ForgotPasswordResetResponse>>(`${this.loginApiUrl}/admin/reset-password`, payload);
  }

  getMyProfile(): Observable<MyProfileResponse> {
    return this.http.get<ApiResponse<MyProfileResponse>>(`${this.apiUrl}/me`).pipe(
      map((res) => res?.data || { email: '', role: '' })
    );
  }

  changeMyPassword(payload: ChangePasswordRequest): Observable<ApiResponse<ChangePasswordResponse>> {
    return this.http.post<ApiResponse<ChangePasswordResponse>>(`${this.apiUrl}/change-password`, payload);
  }

  uploadMyProfilePhoto(file: File): Observable<ApiResponse<ProfilePhotoResponse>> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<ApiResponse<ProfilePhotoResponse>>(`${this.apiUrl}/profile-photo`, formData);
  }

  removeMyProfilePhoto(): Observable<ApiResponse<Record<string, never>>> {
    return this.http.delete<ApiResponse<Record<string, never>>>(`${this.apiUrl}/profile-photo`);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    const exp = Number(payload?.['exp']);
    if (!Number.isFinite(exp) || exp <= 0) {
      return true;
    }

    return Date.now() >= exp * 1000;
  }

  getCurrentRole(): string {
    if (!this.hasValidToken()) {
      return '';
    }

    const storedRole = this.normalizeRole(localStorage.getItem(this.roleKey) || '');
    if (storedRole) {
      return storedRole;
    }

    const token = this.getToken();
    if (!token) {
      return '';
    }

    const decodedRole = this.normalizeRole(this.extractRoleFromJwt(token));
    if (decodedRole) {
      localStorage.setItem(this.roleKey, decodedRole);
    }

    return decodedRole;
  }

  hasAnyRole(roles: string[]): boolean {
    const currentRole = this.getCurrentRole();
    return roles.map((r) => r.toUpperCase()).includes(currentRole);
  }

  isStudentRole(): boolean {
    return this.getCurrentRole() === 'STUDENT';
  }

  canManageCreationActions(): boolean {
    return this.hasAnyRole(['ADMIN', 'FACULTY']);
  }

  getRoleHomeRoute(): string {
    const role = this.getCurrentRole();
    if (role === 'ADMIN') {
      return '/admin/dashboard';
    }
    if (role === 'FACULTY') {
      return '/faculty/dashboard';
    }
    if (role === 'STUDENT') {
      return '/student/dashboard';
    }
    return '/auth/login';
  }

  getRoleBaseRoute(): string {
    const role = this.getCurrentRole();
    if (role === 'ADMIN') {
      return '/admin';
    }
    if (role === 'FACULTY') {
      return '/faculty';
    }
    if (role === 'STUDENT') {
      return '/student';
    }
    return '';
  }

  private extractRoleFromJwt(token: string): string {
    const payload = this.decodeJwtPayload(token);
    if (!payload) {
      return '';
    }

    const authority = Array.isArray(payload['authorities']) ? String(payload['authorities'][0] || '') : '';
    return String(payload['role'] || authority || '');
  }

  private normalizeRole(rawRole: string): string {
    const normalized = (rawRole || '').trim().toUpperCase();
    if (!normalized) {
      return '';
    }

    return normalized.startsWith('ROLE_') ? normalized.slice(5) : normalized;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 2) {
        return null;
      }

      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
