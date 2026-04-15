import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

type MenuItem = {
  label: string;
  icon: string;
  route: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly menuByRole: Record<string, MenuItem[]> = {
    ADMIN: [
      { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
      { label: 'Users', icon: 'group', route: '/users' },
      { label: 'Events & Attendance', icon: 'event', route: '/events' },
      { label: 'Committees', icon: 'apartment', route: '/committees' },
      { label: 'Mail Tools', icon: 'mail', route: '/admin/mail-tools' }
    ],
    FACULTY: [
      { label: 'Dashboard', icon: 'dashboard', route: '/faculty/dashboard' },
      { label: 'My Committees', icon: 'groups', route: '/committees' },
      { label: 'Events', icon: 'event', route: '/events' },
      { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
      { label: 'Attendance', icon: 'fact_check', route: '/attendance' },
      { label: 'Announcements', icon: 'campaign', route: '/announcements' }
    ],
    STUDENT: [
      { label: 'Dashboard', icon: 'dashboard', route: '/student/dashboard' },
      { label: 'Events', icon: 'event', route: '/events' },
      { label: 'My Tasks', icon: 'assignment', route: '/tasks' },
      { label: 'Attendance', icon: 'fact_check', route: '/attendance' },
      { label: 'Announcements', icon: 'campaign', route: '/announcements' }
    ]
  };

  constructor(private authService: AuthService) {}

  get role(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get menuItems(): MenuItem[] {
    return this.menuByRole[this.role] || [];
  }

}
