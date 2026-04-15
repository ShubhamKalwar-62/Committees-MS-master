import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppNotification, NotificationService } from '../../services/notification.service';

type HeaderMenuItem = {
  label: string;
  route: string;
  fragment?: string;
};

type HeaderProfileItem = {
  label: string;
  route: string;
  fragment?: string;
  icon: string;
  hint?: string;
};

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() appName = 'CommitteeOS';
  @Input() hasSidebarOffset = false;
  @ViewChild('notificationsButton') notificationsButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('notificationsPanel') notificationsPanel?: ElementRef<HTMLDivElement>;
  @ViewChild('profileButton') profileButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('profilePanel') profilePanel?: ElementRef<HTMLDivElement>;

  isMobileMenuOpen = false;
  isNotificationsOpen = false;
  isProfileOpen = false;
  notificationFilter: 'all' | 'unread' = 'all';
  notifications: AppNotification[] = [];
  readonly landingRoute = '/';
  readonly brandTagline = 'Campus Operations Platform';
  private notificationsSubscription?: Subscription;

  private readonly menuByRole: Record<string, HeaderMenuItem[]> = {
    ADMIN: [
      { label: 'Dashboard', route: '/admin/dashboard' },
      { label: 'Users', route: '/users' },
      { label: 'Events', route: '/events' },
      { label: 'Committees', route: '/committees' },
      { label: 'Mail-Tools', route: '/admin/mail-tools' }
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
      { label: 'Events', route: '/student/events' },
      { label: 'Committees', route: '/student/committees' },
      { label: 'Tasks', route: '/student/tasks' },
      { label: 'Attendance', route: '/student/attendance' },
      { label: 'Announcements', route: '/student/announcements' },
      { label: 'Profile', route: '/student/profile' }
    ]
  };

  private readonly profileItemsByRole: Record<string, HeaderProfileItem[]> = {
    ADMIN: [
      { label: 'Admin Dashboard', route: '/admin/dashboard', icon: 'dashboard', hint: 'Overview and controls' },
      { label: 'User Management', route: '/users', icon: 'group', hint: 'Manage user accounts' },
      { label: 'Events', route: '/events', icon: 'event', hint: 'Manage events and attendance' },
      { label: 'Mail Tools', route: '/admin/mail-tools', icon: 'mail', hint: 'Reset and email tools' }
    ],
    FACULTY: [
      { label: 'Faculty Dashboard', route: '/faculty/dashboard', icon: 'dashboard', hint: 'Faculty overview' },
      { label: 'My Committees', route: '/committees', icon: 'groups', hint: 'Committee management' },
      { label: 'Events', route: '/events', icon: 'event', hint: 'View and organize events' },
      { label: 'Tasks', route: '/tasks', icon: 'task_alt', hint: 'Track assigned tasks' },
      { label: 'Announcements', route: '/announcements', icon: 'campaign', hint: 'Latest updates' }
    ],
    STUDENT: [
      { label: 'Student Dashboard', route: '/student/dashboard', icon: 'dashboard', hint: 'Your academic overview' },
      { label: 'Events', route: '/student/events', icon: 'event', hint: 'Browse and register for events' },
      { label: 'Committees', route: '/student/committees', icon: 'groups', hint: 'View your committee memberships' },
      { label: 'Tasks', route: '/student/tasks', icon: 'task_alt', hint: 'Track your assigned tasks' },
      { label: 'Attendance', route: '/student/attendance', icon: 'fact_check', hint: 'Check your attendance records' },
      { label: 'Announcements', route: '/student/announcements', icon: 'campaign', hint: 'Read latest announcements' },
      { label: 'Profile', route: '/student/profile', icon: 'settings', hint: 'Manage profile and password' }
    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.notificationService.notifications$.subscribe((items) => {
      this.notifications = items;
    });

    if (this.isLoggedIn) {
      this.notificationService.seedDefaultsForRole(this.currentRole);
    }
  }

  ngOnDestroy(): void {
    this.notificationsSubscription?.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isLandingRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/';
  }

  get usePremiumGuestNavbar(): boolean {
    return !this.isLoggedIn && this.isLandingRoute;
  }

  get currentRole(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get homeRoute(): string {
    return this.isLoggedIn ? this.authService.getRoleHomeRoute() : '/';
  }

  get workspaceBrandName(): string {
    return 'CommitteeOS';
  }

  get workspaceSubtitle(): string {
    return 'Campus Operations Platform';
  }

  get profileInitial(): string {
    const value = this.currentRole || 'USER';
    return value.charAt(0).toUpperCase();
  }

  get searchPlaceholder(): string {
    return 'Search tasks or committees...';
  }

  get brandShortName(): string {
    const words = this.appName
      .split(/\s+/)
      .filter((word) => word !== '&')
      .filter((word) => word.length > 0);

    return words.slice(0, 4).map((word) => word[0].toUpperCase()).join('') || 'CO';
  }

  get brandDisplayName(): string {
    return this.appName || 'CommitteeOS';
  }

  get mobileMenuItems(): HeaderMenuItem[] {
    return this.menuByRole[this.currentRole] || [];
  }

  get profileItems(): HeaderProfileItem[] {
    return this.profileItemsByRole[this.currentRole] || [];
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter((item) => !item.read).length;
  }

  get displayedNotifications(): AppNotification[] {
    if (this.notificationFilter === 'unread') {
      return this.notifications.filter((item) => !item.read);
    }

    return this.notifications;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isNotificationsOpen = false;
      this.isProfileOpen = false;
    }
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    if (this.isNotificationsOpen) {
      this.isMobileMenuOpen = false;
      this.isProfileOpen = false;
    }
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
    if (this.isProfileOpen) {
      this.isNotificationsOpen = false;
      this.isMobileMenuOpen = false;
    }
  }

  onNotificationsButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleNotifications();
  }

  onNotificationsPanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  setNotificationFilter(filter: 'all' | 'unread', event: MouseEvent): void {
    event.stopPropagation();
    this.notificationFilter = filter;
  }

  markNotificationAsRead(notification: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  markAllNotificationsAsRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  dismissNotification(notification: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.remove(notification.id);
  }

  clearAllNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.clearAll();
  }

  onNotificationClick(notification: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }

    if (notification.actionRoute) {
      this.isNotificationsOpen = false;
      this.router.navigate([notification.actionRoute]);
    }
  }

  getNotificationIcon(level: AppNotification['level']): string {
    if (level === 'success') {
      return 'check_circle';
    }
    if (level === 'warning') {
      return 'warning';
    }
    if (level === 'error') {
      return 'error';
    }
    return 'info';
  }

  getNotificationIconToneClass(level: AppNotification['level']): string {
    if (level === 'success') {
      return 'notification-icon-success';
    }
    if (level === 'warning') {
      return 'notification-icon-warning';
    }
    if (level === 'error') {
      return 'notification-icon-error';
    }
    return 'notification-icon-info';
  }

  formatNotificationTime(timestamp: number): string {
    const elapsedMs = Date.now() - timestamp;
    if (elapsedMs < 60_000) {
      return 'Just now';
    }

    const elapsedMinutes = Math.floor(elapsedMs / 60_000);
    if (elapsedMinutes < 60) {
      return `${elapsedMinutes}m ago`;
    }

    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) {
      return `${elapsedHours}h ago`;
    }

    const elapsedDays = Math.floor(elapsedHours / 24);
    return `${elapsedDays}d ago`;
  }

  onProfileButtonClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleProfile();
  }

  onProfilePanelClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeProfileMenu(): void {
    this.isProfileOpen = false;
  }

  onProfileItemSelect(): void {
    this.closeProfileMenu();
    this.closeMobileMenu();
  }

  onProfileLogout(event: MouseEvent): void {
    event.stopPropagation();
    this.logout();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;

    if (this.isNotificationsOpen) {
      const clickedNotificationButton = !!this.notificationsButton?.nativeElement?.contains(target);
      const clickedNotificationPanel = !!this.notificationsPanel?.nativeElement?.contains(target);
      if (!clickedNotificationButton && !clickedNotificationPanel) {
        this.isNotificationsOpen = false;
      }
    }

    if (this.isProfileOpen) {
      const clickedProfileButton = !!this.profileButton?.nativeElement?.contains(target);
      const clickedProfilePanel = !!this.profilePanel?.nativeElement?.contains(target);
      if (!clickedProfileButton && !clickedProfilePanel) {
        this.isProfileOpen = false;
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.clearAll();
    this.closeMobileMenu();
    this.closeProfileMenu();
    this.router.navigate(['/auth/login']);
  }

}
