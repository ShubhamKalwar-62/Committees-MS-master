import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
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
        setTimeout(() => this.router.navigate(['/auth/login']), 800);
      },
      error: (err) => {
        this.submitting = false;
        const errorMessage =
          err?.error?.message || err?.error?.error || err?.message || 'Registration failed.';
        const handled = this.mapFriendlyError(errorMessage);
        this.message = handled.message;
        this.helpText = handled.helpText;
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
