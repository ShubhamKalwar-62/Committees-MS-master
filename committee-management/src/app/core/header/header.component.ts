import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type HeaderMenuItem = {
  label: string;
  route: string;
};

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() appName = 'Committee Management';
  isMobileMenuOpen = false;

  private readonly menuByRole: Record<string, HeaderMenuItem[]> = {
    ADMIN: [
      { label: 'Dashboard', route: '/admin/dashboard' },
      { label: 'Users', route: '/users' },
      { label: 'Events', route: '/events' },
      { label: 'Committees', route: '/committees' },
      { label: 'Tasks', route: '/tasks' },
      { label: 'Attendance', route: '/attendance' },
      { label: 'Announcements', route: '/announcements' },
      { label: 'Mail Tools', route: '/admin/mail-tools' }
    ],
    FACULTY: [
      { label: 'Dashboard', route: '/faculty/dashboard' },
      { label: 'My Committees', route: '/committees' },
      { label: 'Events', route: '/events' },
      { label: 'Tasks', route: '/tasks' },
      { label: 'Attendance', route: '/attendance' },
      { label: 'Announcements', route: '/announcements' }
    ],
    STUDENT: [
      { label: 'Dashboard', route: '/student/dashboard' },
      { label: 'Events', route: '/events' },
      { label: 'My Tasks', route: '/tasks' },
      { label: 'Attendance', route: '/attendance' },
      { label: 'Announcements', route: '/announcements' }
    ]
  };

  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentRole(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get homeRoute(): string {
    return this.isLoggedIn ? this.authService.getRoleHomeRoute() : '/';
  }

  get mobileMenuItems(): HeaderMenuItem[] {
    return this.menuByRole[this.currentRole] || [];
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/auth/login']);
  }

}
