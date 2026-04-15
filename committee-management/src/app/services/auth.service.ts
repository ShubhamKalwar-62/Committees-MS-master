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

          localStorage.setItem('token', res.token);
          const roleFromPayload = res.role || this.extractRoleFromJwt(res.token);
          if (roleFromPayload) {
            localStorage.setItem(this.roleKey, roleFromPayload.toUpperCase());
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
    localStorage.removeItem('token');
    localStorage.removeItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentRole(): string {
    const storedRole = (localStorage.getItem(this.roleKey) || '').toUpperCase();
    if (storedRole) {
      return storedRole;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return '';
    }

    const decodedRole = this.extractRoleFromJwt(token).toUpperCase();
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
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const authority = Array.isArray(payload?.authorities) ? payload.authorities[0] : '';
      return payload?.role || authority || '';
    } catch {
      return '';
    }
  }
}
