import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { StudentOnboardingService } from '../../../services/student-onboarding.service';

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
export class SidebarComponent implements OnInit, OnDestroy {
  isNewUser = false;
  private readonly lockedMenuTooltip = 'Complete onboarding to unlock';
  private onboardingSubscription?: Subscription;

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

  constructor(
    private authService: AuthService,
    private studentOnboardingService: StudentOnboardingService
  ) {}

  ngOnInit(): void {
    this.onboardingSubscription = this.studentOnboardingService.isNewUser$.subscribe((status) => {
      this.isNewUser = status;
    });

    this.studentOnboardingService.refreshStatus();
  }

  ngOnDestroy(): void {
    this.onboardingSubscription?.unsubscribe();
  }

  get role(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get menuItems(): MenuItem[] {
    return this.menuByRole[this.role] || [];
  }

  isMenuItemLocked(item: MenuItem): boolean {
    if (this.role !== 'STUDENT' || !this.isNewUser) {
      return false;
    }

    return item.route === '/tasks' || item.route === '/attendance';
  }

  getMenuItemLockTooltip(item: MenuItem): string | null {
    return this.isMenuItemLocked(item) ? this.lockedMenuTooltip : null;
  }

}
