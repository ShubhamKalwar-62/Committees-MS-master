import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  submitting = false;
  message = '';
  helpText = '';

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['STUDENT', [Validators.required]]
  });

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.registerForm.getRawValue() as {
      name: string;
      email: string;
      password: string;
      role: string;
    };

    const normalizedRole = (payload.role || '').toUpperCase();
    if (normalizedRole !== 'FACULTY' && normalizedRole !== 'STUDENT') {
      this.submitting = false;
      this.message = 'Only FACULTY and STUDENT registrations are allowed.';
      this.helpText = '';
      this.notificationService.add({
        title: 'Registration Blocked',
        message: this.message,
        level: 'warning',
        actionRoute: '/auth/register'
      });
      return;
    }

    this.authService.register(this.registerForm.getRawValue() as {
      name: string;
      email: string;
      password: string;
      role: string;
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.message = 'Registration successful. Please login.';
        this.helpText = '';
        this.notificationService.add({
          title: 'Registration Successful',
          message: this.message,
          level: 'success',
          actionRoute: '/auth/login'
        });
        setTimeout(() => this.router.navigate(['/auth/login']), 800);
      },
      error: (err) => {
        this.submitting = false;
        const errorMessage =
          err?.error?.message || err?.error?.error || err?.message || 'Registration failed.';
        const handled = this.mapFriendlyError(errorMessage);
        this.message = handled.message;
        this.helpText = handled.helpText;
        this.notificationService.add({
          title: 'Registration Failed',
          message: this.message,
          level: 'error',
          actionRoute: '/auth/register'
        });
      }
    });
  }

  private mapFriendlyError(errorMessage: string): { message: string; helpText: string } {
    const normalized = errorMessage.toLowerCase();

    if (normalized.includes('relation "login" does not exist') || normalized.includes('relation') && normalized.includes('does not exist')) {
      return {
        message: 'Registration failed because backend database tables are not initialized.',
        helpText: 'Run database_schema.sql on committees_db, then retry registration.'
      };
    }

    if (normalized.includes('email already exists')) {
      return {
        message: 'This email is already registered. Please use a different email or login.',
        helpText: ''
      };
    }

    return {
      message: errorMessage,
      helpText: ''
    };
  }

}
