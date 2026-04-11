import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

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

  constructor(private authService: AuthService) {}

  sendTestEmail(email: string, name: string): void {
    const normalizedEmail = (email || '').trim();
    const normalizedName = (name || '').trim();

    if (!normalizedEmail) {
      this.success = false;
      this.message = 'Enter a valid email before sending test mail.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.sendTestEmail({
      email: normalizedEmail,
      name: normalizedName || 'Demo User'
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = !!res?.data?.mailSent;
        this.message = res?.data?.mailMessage || res?.message || 'Test email processed.';
      },
      error: (err) => {
        this.loading = false;
        this.success = false;
        this.message = err?.error?.message || 'Test email failed. Check backend mail settings.';
      }
    });
  }
}
