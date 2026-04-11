import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse, AuthRequest, AuthResponse, RegisterRequest, TestEmailRequest, TestEmailResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';
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
