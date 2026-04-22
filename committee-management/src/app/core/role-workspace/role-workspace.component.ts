import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { StudentOnboardingService } from '../../services/student-onboarding.service';
import { ROLE_WORKSPACE_MENUS, RoleWorkspaceItem, WorkspaceRole } from '../navigation/role-navigation.config';

@Component({
  selector: 'app-role-workspace',
  standalone: false,
  templateUrl: './role-workspace.component.html',
  styleUrl: './role-workspace.component.css'
})
export class RoleWorkspaceComponent implements OnInit, OnDestroy {
  isNewUser = false;
  private readonly lockedMenuTooltip = 'Complete onboarding to unlock';
  private onboardingSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
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
    if (this.role !== 'STUDENT' || !this.isNewUser) {
      return false;
    }

    return item.route === '/student/tasks' || item.route.startsWith('/student/attendance');
  }

  getMenuItemLockTooltip(item: RoleWorkspaceItem): string | null {
    return this.isMenuItemLocked(item) ? this.lockedMenuTooltip : null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
