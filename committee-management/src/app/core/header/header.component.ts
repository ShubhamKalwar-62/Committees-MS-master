import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, catchError, forkJoin, of } from 'rxjs';
import { Committee } from '../../models/committee.model';
import { Event as EventModel } from '../../models/event.model';
import { Task } from '../../models/task.model';
import { AuthService } from '../../services/auth.service';
import { CommitteeService } from '../../services/committee.service';
import { EventService } from '../../services/event.service';
import { AppNotification, NotificationService } from '../../services/notification.service';
import { StudentOnboardingService } from '../../services/student-onboarding.service';
import { TaskService } from '../../services/task.service';
import { UserStateService } from '../../services/user-state.service';
import { ROLE_WORKSPACE_MENUS, RoleWorkspaceItem, WorkspaceRole } from '../navigation/role-navigation.config';

type HeaderProfileItem = {
  label: string;
  route: string;
  fragment?: string;
  icon: string;
  hint?: string;
};

type SearchEntityType = 'EVENT' | 'COMMITTEE' | 'TASK';
type SearchSurface = 'desktop' | 'mobile';

type SearchResultItem = {
  type: SearchEntityType;
  id: number;
  title: string;
  subtitle: string;
  route: string;
  icon: string;
};

type SearchResultSection = {
  type: SearchEntityType;
  title: string;
  items: SearchResultItem[];
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
  @ViewChild('desktopSearchContainer') desktopSearchContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('mobileSearchContainer') mobileSearchContainer?: ElementRef<HTMLDivElement>;

  isMobileMenuOpen = false;
  isNotificationsOpen = false;
  isProfileOpen = false;
  searchQuery = '';
  isSearchOpen = false;
  isSearchLoading = false;
  filteredSearchResults: SearchResultItem[] = [];
  searchSections: SearchResultSection[] = [];
  selectedSearchIndex = -1;
  activeSearchSurface: SearchSurface | null = null;
  notificationFilter: 'all' | 'unread' = 'all';
  notifications: AppNotification[] = [];
  readonly landingRoute = '/landing';
  readonly brandTagline = 'Campus Operations Platform';
  isNewUser = false;
  hasEvents = false;
  hasTasks = false;
  hasAttendance = false;
  private readonly lockedMenuTooltip = 'Complete onboarding to unlock';
  private notificationsSubscription?: Subscription;
  private onboardingSubscription?: Subscription;
  private userStateSubscription?: Subscription;
  private searchIndex: SearchResultItem[] = [];
  private hasLoadedSearchIndex = false;

  private readonly profileItemsByRole: Record<WorkspaceRole, HeaderProfileItem[]> = {
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
    private notificationService: NotificationService,
    private studentOnboardingService: StudentOnboardingService,
    private userStateService: UserStateService,
    private eventService: EventService,
    private committeeService: CommitteeService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.notificationService.notifications$.subscribe((items) => {
      this.notifications = items;
    });

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
    this.notificationsSubscription?.unsubscribe();
    this.onboardingSubscription?.unsubscribe();
    this.userStateSubscription?.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get isLandingRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/' || path === '/landing';
  }

  get usePremiumGuestNavbar(): boolean {
    return !this.isLoggedIn && this.isLandingRoute;
  }

  get currentRole(): string {
    return this.currentWorkspaceRole || 'GUEST';
  }

  get currentWorkspaceRole(): WorkspaceRole | null {
    const role = (this.authService.getCurrentRole() || '').toUpperCase();
    if (role === 'ADMIN' || role === 'FACULTY' || role === 'STUDENT') {
      return role;
    }

    return null;
  }

  get homeRoute(): string {
    return this.isLoggedIn ? this.authService.getRoleHomeRoute() : '/landing';
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
    return 'Search in CommitteeOS...';
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

  get hasSearchQuery(): boolean {
    return !!this.searchQuery.trim();
  }

  shouldShowSearchDropdown(surface: SearchSurface): boolean {
    return this.isSearchOpen && this.activeSearchSurface === surface && this.hasSearchQuery;
  }

  getSearchTypeLabel(type: SearchEntityType): string {
    if (type === 'EVENT') {
      return 'Event';
    }
    if (type === 'COMMITTEE') {
      return 'Committee';
    }
    return 'Task';
  }

  getSearchTypeClass(type: SearchEntityType): string {
    if (type === 'EVENT') {
      return 'search-result-type-event';
    }
    if (type === 'COMMITTEE') {
      return 'search-result-type-committee';
    }
    return 'search-result-type-task';
  }

  getSearchResultIndex(result: SearchResultItem): number {
    return this.filteredSearchResults.findIndex(
      (item) => item.type === result.type && item.id === result.id && item.route === result.route
    );
  }

  onSearchFocus(surface: SearchSurface): void {
    this.activeSearchSurface = surface;
    this.ensureSearchIndexLoaded();

    if (this.hasSearchQuery) {
      this.applySearch();
      this.isSearchOpen = true;
    }
  }

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value || '';
    this.selectedSearchIndex = -1;

    if (!this.hasSearchQuery) {
      this.filteredSearchResults = [];
      this.searchSections = [];
      this.isSearchOpen = false;
      return;
    }

    this.ensureSearchIndexLoaded();
    this.applySearch();
    this.isSearchOpen = true;
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSearchDropdown();
      return;
    }

    if (!this.shouldHandleSearchNavigation()) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSearchIndex = (this.selectedSearchIndex + 1) % this.filteredSearchResults.length;
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const total = this.filteredSearchResults.length;
      this.selectedSearchIndex = (this.selectedSearchIndex - 1 + total) % total;
      return;
    }

    if (event.key === 'Enter') {
      const selectedResult = this.filteredSearchResults[this.selectedSearchIndex] || this.filteredSearchResults[0];
      if (selectedResult) {
        event.preventDefault();
        this.onSearchResultClick(selectedResult);
      }
    }
  }

  clearSearch(event?: MouseEvent): void {
    event?.stopPropagation();
    this.searchQuery = '';
    this.filteredSearchResults = [];
    this.searchSections = [];
    this.selectedSearchIndex = -1;
    this.isSearchOpen = false;
  }

  onSearchResultClick(result: SearchResultItem, event?: MouseEvent): void {
    event?.stopPropagation();
    this.searchQuery = '';
    this.filteredSearchResults = [];
    this.searchSections = [];
    this.selectedSearchIndex = -1;
    this.isSearchOpen = false;
    this.activeSearchSurface = null;
    this.closeMobileMenu();
    void this.router.navigateByUrl(result.route);
  }

  get mobileMenuItems(): RoleWorkspaceItem[] {
    if (!this.currentWorkspaceRole) {
      return [];
    }

    return ROLE_WORKSPACE_MENUS[this.currentWorkspaceRole];
  }

  isMenuItemLocked(item: { route: string }): boolean {
    if (this.currentWorkspaceRole !== 'STUDENT') {
      return false;
    }

    const shouldLock = this.isNewUser && !this.hasEvents && !this.hasTasks && !this.hasAttendance;
    if (!shouldLock) {
      return false;
    }

    return item.route === '/student/tasks' || item.route.startsWith('/student/attendance');
  }

  getMenuItemLockTooltip(item: { route: string }): string | null {
    return this.isMenuItemLocked(item) ? this.lockedMenuTooltip : null;
  }

  get profileItems(): HeaderProfileItem[] {
    if (!this.currentWorkspaceRole) {
      return [];
    }

    return this.profileItemsByRole[this.currentWorkspaceRole];
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

    if (this.isSearchOpen) {
      const clickedDesktopSearch = !!this.desktopSearchContainer?.nativeElement?.contains(target);
      const clickedMobileSearch = !!this.mobileSearchContainer?.nativeElement?.contains(target);
      if (!clickedDesktopSearch && !clickedMobileSearch) {
        this.closeSearchDropdown();
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.clearAll();
    this.clearSearch();
    this.closeMobileMenu();
    this.closeProfileMenu();
    this.router.navigate(['/auth/login']);
  }

  private closeSearchDropdown(): void {
    this.isSearchOpen = false;
    this.selectedSearchIndex = -1;
    this.activeSearchSurface = null;
  }

  private shouldHandleSearchNavigation(): boolean {
    return this.isSearchOpen && this.filteredSearchResults.length > 0;
  }

  private ensureSearchIndexLoaded(): void {
    if (this.hasLoadedSearchIndex || this.isSearchLoading) {
      return;
    }

    this.isSearchLoading = true;

    forkJoin({
      events: this.eventService.getEvents().pipe(catchError(() => of([] as EventModel[]))),
      committees: this.committeeService.getCommittees().pipe(catchError(() => of([] as Committee[]))),
      tasks: this.taskService.getTasks().pipe(catchError(() => of([] as Task[])))
    }).subscribe({
      next: ({ events, committees, tasks }) => {
        this.searchIndex = [
          ...this.mapEventsToSearchResults(events),
          ...this.mapCommitteesToSearchResults(committees),
          ...this.mapTasksToSearchResults(tasks)
        ];

        this.hasLoadedSearchIndex = true;
        this.isSearchLoading = false;

        if (this.hasSearchQuery) {
          this.applySearch();
        }
      },
      error: () => {
        this.searchIndex = [];
        this.hasLoadedSearchIndex = true;
        this.isSearchLoading = false;

        if (this.hasSearchQuery) {
          this.applySearch();
        }
      }
    });
  }

  private applySearch(): void {
    const query = this.normalizeSearchText(this.searchQuery);
    if (!query) {
      this.filteredSearchResults = [];
      this.searchSections = [];
      this.isSearchOpen = false;
      return;
    }

    const rankedResults = this.searchIndex
      .map((item) => {
        const normalizedTitle = this.normalizeSearchText(item.title);
        const normalizedSubtitle = this.normalizeSearchText(item.subtitle);
        const combined = `${normalizedTitle} ${normalizedSubtitle}`.trim();

        const combinedIndex = combined.indexOf(query);
        if (combinedIndex === -1) {
          return null;
        }

        const titleIndex = normalizedTitle.indexOf(query);
        const subtitleIndex = normalizedSubtitle.indexOf(query);
        let score = 100;

        if (titleIndex === 0) {
          score = 0;
        } else if (titleIndex > 0) {
          score = 10 + titleIndex;
        } else if (subtitleIndex === 0) {
          score = 30;
        } else if (subtitleIndex > 0) {
          score = 40 + subtitleIndex;
        } else {
          score = 70 + combinedIndex;
        }

        return {
          item,
          score: score + this.getSearchTypeWeight(item.type)
        };
      })
      .filter((ranked): ranked is { item: SearchResultItem; score: number } => !!ranked)
      .sort((left, right) => left.score - right.score || left.item.title.localeCompare(right.item.title))
      .slice(0, 12)
      .map((ranked) => ranked.item);

    const events = rankedResults.filter((item) => item.type === 'EVENT');
    const committees = rankedResults.filter((item) => item.type === 'COMMITTEE');
    const tasks = rankedResults.filter((item) => item.type === 'TASK');

    this.searchSections = [
      { type: 'EVENT' as const, title: 'Events', items: events },
      { type: 'COMMITTEE' as const, title: 'Committees', items: committees },
      { type: 'TASK' as const, title: 'Tasks', items: tasks }
    ].filter((section) => section.items.length > 0);

    this.filteredSearchResults = this.searchSections.flatMap((section) => section.items);
    this.isSearchOpen = true;
  }

  private mapEventsToSearchResults(events: EventModel[]): SearchResultItem[] {
    return (events || [])
      .filter((event) => Number.isFinite(Number(event.id)) && !!event.eventName?.trim())
      .map((event) => {
        const eventId = Number(event.id);
        const subtitleParts = [
          this.formatSearchDate(event.eventDate),
          (event.location || '').trim()
        ].filter((value) => !!value);

        return {
          type: 'EVENT' as const,
          id: eventId,
          title: event.eventName.trim(),
          subtitle: subtitleParts.join(' | '),
          route: this.resolveSearchRoute('EVENT', eventId),
          icon: 'event'
        };
      });
  }

  private mapCommitteesToSearchResults(committees: Committee[]): SearchResultItem[] {
    return (committees || [])
      .filter((committee) => Number.isFinite(Number(committee.id)) && !!committee.committeeName?.trim())
      .map((committee) => {
        const committeeId = Number(committee.id);
        const subtitleParts = [
          (committee.facultyInchargeName || '').trim(),
          (committee.committeeInfo || '').trim()
        ].filter((value) => !!value);

        return {
          type: 'COMMITTEE' as const,
          id: committeeId,
          title: committee.committeeName.trim(),
          subtitle: subtitleParts.join(' | '),
          route: this.resolveSearchRoute('COMMITTEE', committeeId),
          icon: 'groups'
        };
      });
  }

  private mapTasksToSearchResults(tasks: Task[]): SearchResultItem[] {
    return (tasks || [])
      .filter((task) => Number.isFinite(Number(task.id)) && !!task.title?.trim())
      .map((task) => {
        const taskId = Number(task.id);
        const subtitleParts = [
          this.formatStatusForSearch(task.status),
          this.formatPriorityForSearch(task.priority),
          (task.committeeName || '').trim()
        ].filter((value) => !!value);

        return {
          type: 'TASK' as const,
          id: taskId,
          title: task.title.trim(),
          subtitle: subtitleParts.join(' | '),
          route: this.resolveSearchRoute('TASK', taskId),
          icon: 'task_alt'
        };
      });
  }

  private resolveSearchRoute(type: SearchEntityType, id: number): string {
    const isStudent = this.currentWorkspaceRole === 'STUDENT';

    if (type === 'EVENT') {
      return isStudent ? `/student/events/${id}` : `/events/${id}`;
    }

    if (type === 'COMMITTEE') {
      return isStudent ? `/student/committees/${id}` : `/committees/${id}`;
    }

    return isStudent ? `/student/tasks/${id}` : `/tasks/${id}`;
  }

  private formatSearchDate(rawValue: string | undefined): string {
    if (!rawValue) {
      return '';
    }

    const parsed = new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private formatStatusForSearch(status: string | undefined): string {
    const normalized = this.normalizeSearchText(status).replace(/_/g, ' ');
    if (!normalized) {
      return '';
    }

    return `Status: ${normalized}`;
  }

  private formatPriorityForSearch(priority: string | undefined): string {
    const normalized = this.normalizeSearchText(priority).replace(/_/g, ' ');
    if (!normalized) {
      return '';
    }

    return `Priority: ${normalized}`;
  }

  private normalizeSearchText(value: string | undefined): string {
    return (value || '').trim().toLowerCase();
  }

  private getSearchTypeWeight(type: SearchEntityType): number {
    if (type === 'EVENT') {
      return 0;
    }
    if (type === 'COMMITTEE') {
      return 5;
    }
    return 10;
  }

}
