import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse } from '../../../models/auth.model';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  loading = false;
  errorMessage = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.getRawValue() as { email: string; password: string }).subscribe({
      next: (response) => {
        this.loading = false;
        const homeRoute = this.resolveHomeRoute(response);
        const role = this.authService.getCurrentRole() || 'USER';
        this.notificationService.add({
          title: 'Signed In',
          message: `You are signed in as ${role}.`,
          level: 'success',
          actionRoute: homeRoute
        });

        void this.router.navigateByUrl(homeRoute).then((navigated) => {
          if (!navigated) {
            void this.router.navigateByUrl(this.authService.getRoleHomeRoute());
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please check your credentials.';
        this.notificationService.add({
          title: 'Sign In Failed',
          message: this.errorMessage,
          level: 'warning',
          actionRoute: '/auth/login'
        });
      }
    });
  }

  private resolveHomeRoute(response: AuthResponse): string {
    const role = (response?.role || this.authService.getCurrentRole() || '').trim().toUpperCase();
    if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
      return '/admin/dashboard';
    }
    if (role === 'FACULTY' || role === 'ROLE_FACULTY') {
      return '/faculty/dashboard';
    }
    if (role === 'STUDENT' || role === 'ROLE_STUDENT') {
      return '/student/dashboard';
    }

    return this.authService.getRoleHomeRoute();
  }

}
