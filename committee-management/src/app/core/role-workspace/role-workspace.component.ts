import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { StudentOnboardingService } from '../../services/student-onboarding.service';
import { UserStateService } from '../../services/user-state.service';
import { ROLE_WORKSPACE_MENUS, RoleWorkspaceItem, WorkspaceRole } from '../navigation/role-navigation.config';

@Component({
  selector: 'app-role-workspace',
  standalone: false,
  templateUrl: './role-workspace.component.html',
  styleUrl: './role-workspace.component.css'
})
export class RoleWorkspaceComponent implements OnInit, OnDestroy {
  isNewUser = false;
  hasEvents = false;
  hasTasks = false;
  hasAttendance = false;
  private readonly lockedMenuTooltip = 'Complete onboarding to unlock';
  private onboardingSubscription?: Subscription;
  private userStateSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private studentOnboardingService: StudentOnboardingService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
    this.onboardingSubscription = this.studentOnboardingService.isNewUser$.subscribe((status) => {
      this.isNewUser = status;
    });

    this.userStateSubscription = this.userStateService.hasEvents$.subscribe((status) => {
      this.hasEvents = status;
    });

    this.userStateSubscription?.add(this.userStateService.hasTasks$.subscribe((status) => {
      this.hasTasks = status;
    }));

    this.userStateSubscription?.add(this.userStateService.hasAttendance$.subscribe((status) => {
      this.hasAttendance = status;
    }));

    this.studentOnboardingService.refreshStatus();
  }

  ngOnDestroy(): void {
    this.onboardingSubscription?.unsubscribe();
    this.userStateSubscription?.unsubscribe();
  }

  get role(): WorkspaceRole | null {
    const currentRole = (this.authService.getCurrentRole() || '').toUpperCase();
    if (currentRole === 'ADMIN' || currentRole === 'FACULTY' || currentRole === 'STUDENT') {
      return currentRole;
    }

    return null;
  }

  get roleLabel(): string {
    return this.role || 'GUEST';
  }

  get roleSubtitle(): string {
    return 'Campus Operations Platform';
  }

  get menuItems(): RoleWorkspaceItem[] {
    if (!this.role) {
      return [];
    }

    return ROLE_WORKSPACE_MENUS[this.role];
  }

  isMenuItemLocked(item: RoleWorkspaceItem): boolean {
    if (this.role !== 'STUDENT') {
      return false;
    }

    const shouldLock = this.isNewUser && !this.hasEvents && !this.hasTasks && !this.hasAttendance;
    if (!shouldLock) {
      return false;
    }

    return item.route === '/student/tasks' || item.route.startsWith('/student/attendance');
  }

  getMenuItemLockTooltip(item: RoleWorkspaceItem): string | null {
    return this.isMenuItemLocked(item) ? this.lockedMenuTooltip : null;
  }

  navigateToLanding(): void {
    void this.router.navigate(['/landing']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
