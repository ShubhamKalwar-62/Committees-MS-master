import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-mail-tools',
  standalone: false,
  templateUrl: './mail-tools.component.html',
  styleUrl: './mail-tools.component.css'
})
export class MailToolsComponent {
  loading = false;
  success = false;
  message = '';

  readonly supportedRoles: Array<'STUDENT' | 'FACULTY'> = ['STUDENT', 'FACULTY'];
  selectedRole: 'STUDENT' | 'FACULTY' = 'STUDENT';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  processForgotPasswordReset(email: string, role: string, newPassword: string, confirmPassword: string): void {
    const normalizedEmail = (email || '').trim();
    const normalizedRole = (role || '').trim().toUpperCase();
    const password = (newPassword || '').trim();
    const confirm = (confirmPassword || '').trim();

    if (!normalizedEmail) {
      this.success = false;
      this.message = 'Enter a valid user email.';
      this.notificationService.add({
        title: 'Reset Validation Failed',
        message: this.message,
        level: 'warning',
        actionRoute: '/admin/mail-tools'
      });
      return;
    }

    if (!this.supportedRoles.includes(normalizedRole as 'STUDENT' | 'FACULTY')) {
      this.success = false;
      this.message = 'Only STUDENT and FACULTY forgot-password resets are allowed here.';
      this.notificationService.add({
        title: 'Reset Validation Failed',
        message: this.message,
        level: 'warning',
        actionRoute: '/admin/mail-tools'
      });
      return;
    }

    if (password.length < 6) {
      this.success = false;
      this.message = 'New password must be at least 6 characters.';
      this.notificationService.add({
        title: 'Reset Validation Failed',
        message: this.message,
        level: 'warning',
        actionRoute: '/admin/mail-tools'
      });
      return;
    }

    if (password !== confirm) {
      this.success = false;
      this.message = 'Password and confirm password do not match.';
      this.notificationService.add({
        title: 'Reset Validation Failed',
        message: this.message,
        level: 'warning',
        actionRoute: '/admin/mail-tools'
      });
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.resetForgotPasswordForUser({
      email: normalizedEmail,
      role: normalizedRole as 'STUDENT' | 'FACULTY',
      newPassword: password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = !!res?.success;
        this.message = res?.data?.mailMessage || res?.message || 'Forgot-password reset processed successfully.';
        this.notificationService.add({
          title: this.success ? 'Password Reset Processed' : 'Password Reset Warning',
          message: this.message,
          level: this.success ? 'success' : 'warning',
          actionRoute: '/admin/mail-tools'
        });
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.message = err?.error?.message || 'Forgot-password reset failed.';
        this.notificationService.add({
          title: 'Password Reset Failed',
          message: this.message,
          level: 'error',
          actionRoute: '/admin/mail-tools'
        });
      }
    });
  }
}
