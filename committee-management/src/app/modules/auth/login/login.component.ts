import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
      next: () => {
        this.loading = false;
        const homeRoute = this.authService.getRoleHomeRoute();
        const role = this.authService.getCurrentRole() || 'USER';
        this.notificationService.add({
          title: 'Signed In',
          message: `You are signed in as ${role}.`,
          level: 'success',
          actionRoute: homeRoute
        });
        this.router.navigateByUrl(homeRoute);
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

}
