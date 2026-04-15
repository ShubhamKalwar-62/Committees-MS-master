import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type RoleWorkspaceItem = {
  label: string;
  icon: string;
  route: string;
  fragment?: string;
};

@Component({
  selector: 'app-role-workspace',
  standalone: false,
  templateUrl: './role-workspace.component.html',
  styleUrl: './role-workspace.component.css'
})
export class RoleWorkspaceComponent {
  private readonly menuByRole: Record<string, RoleWorkspaceItem[]> = {
    ADMIN: [
      { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
      { label: 'Users', icon: 'person_outline', route: '/users' },
      { label: 'Committees', icon: 'groups', route: '/committees' },
      { label: 'Events', icon: 'event', route: '/events' },
      { label: 'Mail-Tools', icon: 'settings', route: '/admin/mail-tools' }
    ],
    FACULTY: [
      { label: 'Dashboard', icon: 'dashboard', route: '/faculty/dashboard' },
      { label: 'Committees', icon: 'groups', route: '/committees' },
      { label: 'Events', icon: 'event', route: '/events' },
      { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
      { label: 'Attendance', icon: 'fact_check', route: '/attendance' },
      { label: 'Announcements', icon: 'campaign', route: '/announcements' }
    ],
    STUDENT: [
      { label: 'Dashboard', icon: 'dashboard', route: '/student/dashboard' },
      { label: 'Events', icon: 'event', route: '/student/events' },
      { label: 'Committees', icon: 'groups', route: '/student/committees' },
      { label: 'Tasks', icon: 'task_alt', route: '/student/tasks' },
      { label: 'Attendance', icon: 'fact_check', route: '/student/attendance' },
      { label: 'Announcements', icon: 'campaign', route: '/student/announcements' },
      { label: 'Profile', icon: 'settings', route: '/student/profile' }
    ]
  };

  constructor(private authService: AuthService, private router: Router) {}

  get role(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get roleSubtitle(): string {
    return 'Campus Operations Platform';
  }

  get menuItems(): RoleWorkspaceItem[] {
    return this.menuByRole[this.role] || [];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
