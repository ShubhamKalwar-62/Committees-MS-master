import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import type { Chart, ChartConfiguration } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { TaskService } from '../../../services/task.service';
import { CommitteeService } from '../../../services/committee.service';
import { AttendanceService } from '../../../services/attendance.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { UserService } from '../../../services/user.service';
import type { ActivityFeedItem } from '../../../shared/dashboard-ui/activity-feed/activity-feed.component';
import { Event } from '../../../models/event.model';
import { Task } from '../../../models/task.model';
import { Committee } from '../../../models/committee.model';
import { Attendance } from '../../../models/attendance.model';
import { Announcement } from '../../../models/announcement.model';
import { User } from '../../../models/user.model';
import { MyProfileResponse } from '../../../models/auth.model';
import { StudentOnboardingService } from '../../../services/student-onboarding.service';
import { EventRegistration } from '../../../models/registration.model';
import { UserStateService } from '../../../services/user-state.service';

type DashboardRole = 'ADMIN' | 'FACULTY' | 'STUDENT';
type StatTone = 'blue' | 'indigo' | 'green' | 'amber' | 'gray';
type TimelineTone = 'info' | 'success' | 'warning' | 'neutral';

type DashboardKpiCard = {
  title: string;
  value: string;
  icon: string;
  trend: string;
  subtitle: string;
  tone: StatTone;
  route: string;
};

type DashboardMetric = {
  label: string;
  value: string;
};

type DashboardActivityItem = ActivityFeedItem & {
  tone: TimelineTone;
  route?: string;
  fragment?: string;
};

type DashboardHighlightItem = {
  title: string;
  detail: string;
  status: string;
  route: string;
};

type DashboardResourceItem = {
  title: string;
  detail: string;
  icon: string;
  actionLabel: string;
  route: string;
  fragment?: string;
};

type StudentExploreItem = {
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  actionLabel: string;
};

type DashboardProgressItem = {
  title: string;
  percentage: number;
  valueLabel: string;
  description: string;
};

type DashboardChartData = {
  labels: string[];
  eventsSeries: number[];
  attendanceSeries: number[];
  attendanceMax: number;
};

type DashboardChartPalette = {
  line: string;
  lineFill: string;
  bars: string[];
};

type DashboardConfig = {
  headerTitle: string;
  headerSubtitle: string;
  badgeLabel: string;
  updatedAt: string;
  actions: {
    primaryLabel: string;
    primaryRoute: string;
    secondaryLabel: string;
    secondaryRoute: string;
  };
  kpiCards: DashboardKpiCard[];
  miniMetrics: DashboardMetric[];
  chartTitles: {
    events: string;
    attendance: string;
  };
  chartData: DashboardChartData;
  chartPalette: DashboardChartPalette;
  donut: {
    title: string;
    value: string;
    percentage: number;
    subtitle: string;
    color: string;
  };
  progressCards: DashboardProgressItem[];
  activityTitle: string;
  activityItems: DashboardActivityItem[];
  highlightTitle: string;
  highlightItems: DashboardHighlightItem[];
  bottomTitle: string;
  bottomSubtitle: string;
  resources: DashboardResourceItem[];
};

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('eventsTrendChart') eventsTrendChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceChart') attendanceChart?: ElementRef<HTMLCanvasElement>;

  loading = true;
  isNewUser = false;
  currentRole: DashboardRole = 'STUDENT';
  tasks: Task[] = [];
  attendanceRecords: Attendance[] = [];
  events: Event[] = [];
  dashboardConfig: DashboardConfig = this.createInitialConfig('STUDENT');

  readonly studentExploreItems: StudentExploreItem[] = [
    {
      title: 'Events',
      subtitle: 'Discover upcoming events and register for sessions you care about.',
      route: '/student/events',
      icon: 'event',
      actionLabel: 'Browse Events'
    },
    {
      title: 'Committees',
      subtitle: 'Explore active committees and join one to unlock collaboration workflows.',
      route: '/student/committees',
      icon: 'groups',
      actionLabel: 'View Committees'
    },
    {
      title: 'Announcements',
      subtitle: 'Stay updated with the latest campus and committee notices.',
      route: '/student/announcements',
      icon: 'campaign',
      actionLabel: 'Open Announcements'
    }
  ];

  private eventsChartRef?: Chart;
  private attendanceChartRef?: Chart;
  private chartCtor?: typeof import('chart.js').Chart;
  private chartRenderAttempts = 0;
  private readonly maxChartRenderAttempts = 8;

  constructor(
    private authService: AuthService,
    private router: Router,
    private eventService: EventService,
    private taskService: TaskService,
    private committeeService: CommitteeService,
    private attendanceService: AttendanceService,
    private announcementService: AnnouncementService,
    private userService: UserService,
    private studentOnboardingService: StudentOnboardingService,
    private userStateService: UserStateService
  ) {}

  get showStudentOnboarding(): boolean {
    return this.currentRole === 'STUDENT' && this.isNewUser;
  }

  get visibleKpiCards(): DashboardKpiCard[] {
    if (!this.showStudentOnboarding) {
      return this.dashboardConfig.kpiCards;
    }

    return this.dashboardConfig.kpiCards.filter((card) => !this.isStudentLockedKpiCard(card));
  }

  get displayedResources(): DashboardResourceItem[] {
    if (!this.showStudentOnboarding) {
      return this.dashboardConfig.resources;
    }

    return [
      {
        title: 'Browse Events',
        detail: 'Find upcoming events and register to start your journey.',
        icon: 'event',
        actionLabel: 'Browse Events',
        route: '/student/events'
      },
      {
        title: 'View Committees',
        detail: 'Check committee goals, roles, and participation opportunities.',
        icon: 'groups',
        actionLabel: 'View Committees',
        route: '/student/committees'
      },
      {
        title: 'Announcements',
        detail: 'Stay informed with important platform and committee updates.',
        icon: 'campaign',
        actionLabel: 'View Announcements',
        route: '/student/announcements'
      }
    ];
  }

  ngOnInit(): void {
    this.currentRole = this.resolveRole();
    this.dashboardConfig = this.createInitialConfig(this.currentRole);
    this.loadDashboardData(this.currentRole);
  }

  ngAfterViewInit(): void {
    this.scheduleChartRender();
  }

  ngOnDestroy(): void {
    this.eventsChartRef?.destroy();
    this.attendanceChartRef?.destroy();
  }

  onPrimaryAction(): void {
    this.navigateToRoute(this.dashboardConfig.actions.primaryRoute);
  }

  onSecondaryAction(): void {
    this.navigateToRoute(this.dashboardConfig.actions.secondaryRoute);
  }

  onKpiCardSelect(card: DashboardKpiCard): void {
    this.navigateToRoute(card.route);
  }

  onActivityItemSelect(item: ActivityFeedItem): void {
    const selected = item as DashboardActivityItem;
    this.navigateToRoute(selected.route, selected.fragment);
  }

  onHighlightSelect(item: DashboardHighlightItem): void {
    this.navigateToRoute(item.route);
  }

  onResourceSelect(resource: DashboardResourceItem): void {
    this.navigateToRoute(resource.route, resource.fragment);
  }

  private resolveRole(): DashboardRole {
    const resolvedRole = (this.authService.getCurrentRole() || 'STUDENT').toUpperCase();
    if (resolvedRole === 'ADMIN' || resolvedRole === 'FACULTY' || resolvedRole === 'STUDENT') {
      return resolvedRole;
    }

    return 'STUDENT';
  }

  private loadDashboardData(role: DashboardRole): void {
    const profile$ = this.authService.getMyProfile().pipe(
      catchError(() => of({ email: '', role, committeeMemberships: [] } as MyProfileResponse))
    );

    profile$.pipe(
      switchMap((profile) => {
        const userId = profile.userId || null;
        const users$ = role === 'ADMIN'
          ? this.userService.getUsers().pipe(catchError(() => of([] as User[])))
          : of([] as User[]);

        const registrations$ = role === 'STUDENT' && userId
          ? this.eventService.getRegistrationsForUser(userId).pipe(catchError(() => of([] as EventRegistration[])))
          : of([] as EventRegistration[]);

        return combineLatest([
          of(profile),
          this.eventService.getEvents().pipe(catchError(() => of([] as Event[]))),
          this.taskService.getTasks().pipe(catchError(() => of([] as Task[]))),
          this.committeeService.getCommittees().pipe(catchError(() => of([] as Committee[]))),
          (role === 'STUDENT' && userId
            ? this.attendanceService.getAttendanceList({ userId })
            : this.attendanceService.getAttendanceList()).pipe(catchError(() => of([] as Attendance[]))),
          this.announcementService.getAnnouncements().pipe(catchError(() => of([] as Announcement[]))),
          users$,
          registrations$
        ]);
      })
    ).subscribe(([profile, events, tasks, committees, records, announcements, users, registeredEvents]) => {
      const userId = profile.userId || null;
      const scopedRegistrations = role === 'STUDENT' ? (registeredEvents || []) : [];
      const scopedRegisteredEvents = role === 'STUDENT' ? this.mapRegistrationsToEvents(scopedRegistrations) : [];
      const scopedApprovedEvents = role === 'STUDENT'
        ? this.mapRegistrationsToEvents(scopedRegistrations.filter((registration) => registration.status === 'APPROVED'))
        : [];
      const scopedCommittees = this.scopeCommitteesForRole(role, committees, profile, userId);
      const scopedEvents = this.scopeEventsForRole(role, events, scopedRegisteredEvents, scopedCommittees);
      const scopedTasks = this.scopeTasksForRole(role, tasks, userId);
      const scopedRecords = this.scopeAttendanceForRole(role, records, userId, scopedEvents);
      const attendanceRate = this.getAttendanceRate(scopedRecords);
      const openTasksCount = scopedTasks.filter((task) => this.isOpenTaskStatus(task.status)).length;
      const completedTasksCount = scopedTasks.filter((task) => this.isCompletedTaskStatus(task.status)).length;
      const chartData = this.buildChartData(scopedEvents, scopedRecords);

      const config = this.createInitialConfig(role);
      config.updatedAt = this.getUpdatedAtLabel();
      config.chartData = chartData;
      config.activityItems = this.buildActivityItems(role, scopedEvents, scopedTasks, announcements);
      config.highlightItems = this.buildHighlightItems(role, scopedEvents, scopedCommittees, announcements);

      if (role === 'ADMIN') {
        config.kpiCards[0].value = this.formatCount(users.length);
        config.kpiCards[0].trend = `${users.filter((item) => !!item.role).length} with roles`;
        config.kpiCards[1].value = this.formatCount(scopedCommittees.length);
        config.kpiCards[1].trend = `${this.countRecentByDate(scopedEvents.map((item) => item.eventDate), 30)} new in 30d`;
        config.kpiCards[2].value = this.formatCount(scopedEvents.length);
        config.kpiCards[2].trend = `${this.countUpcomingEvents(scopedEvents)} upcoming`;
        config.kpiCards[3].value = attendanceRate === null ? '--' : `${attendanceRate}%`;
        config.kpiCards[3].trend = `${this.formatCount(scopedRecords.length)} records`;

        config.miniMetrics = [
          { label: 'Announcements', value: this.formatCount(announcements.length) },
          { label: 'Open tasks', value: this.formatCount(openTasksCount) },
          { label: 'Attendance records', value: this.formatCount(scopedRecords.length) }
        ];

        config.progressCards = [
          {
            title: 'Task Completion',
            percentage: this.getRatioPercentage(completedTasksCount, scopedTasks.length),
            valueLabel: `${this.getRatioPercentage(completedTasksCount, scopedTasks.length)}%`,
            description: 'Completed tasks out of total tracked tasks.'
          },
          {
            title: 'Attendance Coverage',
            percentage: attendanceRate || 0,
            valueLabel: attendanceRate === null ? '--' : `${attendanceRate}%`,
            description: 'Present and late records as a share of all attendance records.'
          }
        ];
      }

      if (role === 'FACULTY') {
        config.kpiCards[0].value = this.formatCount(scopedCommittees.length);
        config.kpiCards[0].trend = `${this.countRecentByDate(scopedEvents.map((item) => item.eventDate), 14)} active this cycle`;
        config.kpiCards[1].value = `${this.getRatioPercentage(completedTasksCount, scopedTasks.length)}%`;
        config.kpiCards[1].trend = `${this.formatCount(openTasksCount)} open`;
        config.kpiCards[2].value = this.formatCount(scopedEvents.length);
        config.kpiCards[2].trend = `${this.countUpcomingEvents(scopedEvents)} upcoming`;
        config.kpiCards[3].value = attendanceRate === null ? '--' : `${attendanceRate}%`;
        config.kpiCards[3].trend = `${this.formatCount(scopedRecords.length)} records`;

        config.miniMetrics = [
          { label: 'Announcements', value: this.formatCount(announcements.length) },
          { label: 'Open tasks', value: this.formatCount(openTasksCount) },
          { label: 'Events this month', value: this.formatCount(this.countRecentByDate(scopedEvents.map((item) => item.eventDate), 30)) }
        ];

        config.progressCards = [
          {
            title: 'Task Completion',
            percentage: this.getRatioPercentage(completedTasksCount, scopedTasks.length),
            valueLabel: `${this.getRatioPercentage(completedTasksCount, scopedTasks.length)}%`,
            description: 'Completed tasks out of total tracked tasks.'
          },
          {
            title: 'Attendance Pulse',
            percentage: attendanceRate || 0,
            valueLabel: attendanceRate === null ? '--' : `${attendanceRate}%`,
            description: 'Present and late records as a share of all attendance records.'
          }
        ];
      }

      if (role === 'STUDENT') {
        this.tasks = scopedTasks;
        this.attendanceRecords = scopedRecords;
        this.events = scopedEvents;

        const hasTasks = this.tasks.length > 0;
        const hasAttendance = this.attendanceRecords.length > 0;
        const hasApprovedEvents = scopedApprovedEvents.length > 0;

        this.userStateService.setActivityState({
          hasEvents: hasApprovedEvents,
          hasTasks,
          hasAttendance
        });

        this.isNewUser =
          !hasApprovedEvents &&
          !hasTasks &&
          !hasAttendance;

        if ((profile.committeeMemberships || []).length > 0) {
          this.isNewUser = false;
        }

        this.studentOnboardingService.setIsNewUser(this.isNewUser);

        config.kpiCards[0].value = this.formatCount(scopedEvents.length);
        config.kpiCards[0].trend = `${this.countUpcomingEvents(scopedEvents)} upcoming`;
        config.kpiCards[1].value = attendanceRate === null ? '--' : `${attendanceRate}%`;
        config.kpiCards[1].trend = `${this.formatCount(scopedRecords.length)} records`;
        config.kpiCards[2].value = this.formatCount(announcements.length);
        config.kpiCards[2].trend = `${this.formatCount(this.countRecentByDate(announcements.map((item) => item.createdAt), 7))} in 7d`;
        config.kpiCards[3].value = this.formatCount(openTasksCount);
        config.kpiCards[3].trend = `${this.formatCount(completedTasksCount)} completed`;

        config.miniMetrics = [
          { label: 'Committees', value: this.formatCount(scopedCommittees.length) },
          { label: 'Open tasks', value: this.formatCount(openTasksCount) },
          { label: 'Attendance records', value: this.formatCount(scopedRecords.length) }
        ];

        config.progressCards = [
          {
            title: 'Personal Task Completion',
            percentage: this.getRatioPercentage(completedTasksCount, scopedTasks.length),
            valueLabel: `${this.getRatioPercentage(completedTasksCount, scopedTasks.length)}%`,
            description: 'Completed tasks out of total assigned tasks.'
          },
          {
            title: 'Attendance Snapshot',
            percentage: attendanceRate || 0,
            valueLabel: attendanceRate === null ? '--' : `${attendanceRate}%`,
            description: 'Present and late records as a share of all attendance records.'
          }
        ];

        if (this.isNewUser) {
          config.actions.primaryLabel = 'Browse Events';
          config.actions.primaryRoute = '/student/events';
          config.actions.secondaryLabel = 'View Committees';
          config.actions.secondaryRoute = '/student/committees';
        }
      } else {
        this.tasks = [];
        this.attendanceRecords = [];
        this.events = [];
        this.isNewUser = false;
        this.userStateService.resetActivityState();
        this.studentOnboardingService.setIsNewUser(false);
      }

      const donutRate = attendanceRate || 0;
      config.donut.percentage = donutRate;
      config.donut.value = attendanceRate === null ? '--' : `${attendanceRate}%`;

      this.dashboardConfig = config;
      this.loading = false;
      this.chartRenderAttempts = 0;

      if (!this.showStudentOnboarding) {
        this.scheduleChartRender();
      }
    });
  }

  private isStudentLockedKpiCard(card: DashboardKpiCard): boolean {
    if (this.currentRole !== 'STUDENT') {
      return false;
    }

    const route = (card.route || '').toLowerCase();
    return route === '/student/tasks' || route === '/student/attendance';
  }

  private createInitialConfig(role: DashboardRole): DashboardConfig {
    const updatedAt = this.getUpdatedAtLabel();

    if (role === 'ADMIN') {
      return {
        headerTitle: 'CommitteeOS Admin Dashboard',
        headerSubtitle: 'System-wide visibility for users, committees, events, and operational health.',
        badgeLabel: 'LIVE SNAPSHOT',
        updatedAt,
        actions: {
          primaryLabel: 'Manage Users',
          primaryRoute: '/users',
          secondaryLabel: 'Review Events',
          secondaryRoute: '/events'
        },
        kpiCards: [
          { title: 'Total Users', value: '--', icon: 'group', trend: 'Live', subtitle: 'Registered platform users', tone: 'blue', route: '/users' },
          { title: 'Active Committees', value: '--', icon: 'groups', trend: 'Live', subtitle: 'Current committees available', tone: 'indigo', route: '/committees' },
          { title: 'Events Pipeline', value: '--', icon: 'event', trend: 'Live', subtitle: 'Events in active planning window', tone: 'green', route: '/events' },
          { title: 'Attendance Compliance', value: '--', icon: 'fact_check', trend: 'Live', subtitle: 'Derived from participation records', tone: 'amber', route: '/attendance' }
        ],
        miniMetrics: [],
        chartTitles: {
          events: 'Events Throughput',
          attendance: 'Attendance Compliance Trend'
        },
        chartData: {
          labels: [],
          eventsSeries: [],
          attendanceSeries: [],
          attendanceMax: 100
        },
        chartPalette: {
          line: '#2563eb',
          lineFill: 'rgba(37, 99, 235, 0.14)',
          bars: ['#1d4ed8', '#2563eb', '#4f46e5', '#0ea5e9', '#10b981', '#6366f1']
        },
        donut: {
          title: 'System Attendance',
          value: '--',
          percentage: 0,
          subtitle: 'Campus attendance coverage based on live records.',
          color: '#2563eb'
        },
        progressCards: [],
        activityTitle: 'Operational Activity Feed',
        activityItems: [],
        highlightTitle: 'System Highlights',
        highlightItems: [],
        bottomTitle: 'Events, Tasks, and Resources',
        bottomSubtitle: 'Cross-system resources for administration workflows.',
        resources: [
          { title: 'User Management', detail: 'View and maintain user accounts and roles.', icon: 'table_chart', actionLabel: 'Open Users', route: '/users' },
          { title: 'Committee Workspace', detail: 'Review committee details and member responsibilities.', icon: 'gavel', actionLabel: 'Open Committees', route: '/committees' },
          { title: 'Mail Broadcast Center', detail: 'Send reset notifications and account support messages.', icon: 'mail', actionLabel: 'Open Mail Tools', route: '/admin/mail-tools' }
        ]
      };
    }

    if (role === 'FACULTY') {
      return {
        headerTitle: 'CommitteeOS Faculty Dashboard',
        headerSubtitle: 'Assigned committee operations, session readiness, and execution progress at a glance.',
        badgeLabel: 'LIVE SNAPSHOT',
        updatedAt,
        actions: {
          primaryLabel: 'Open Task Board',
          primaryRoute: '/tasks',
          secondaryLabel: 'Upcoming Sessions',
          secondaryRoute: '/events'
        },
        kpiCards: [
          { title: 'Assigned Committees', value: '--', icon: 'groups_2', trend: 'Live', subtitle: 'Committees visible to your role', tone: 'indigo', route: '/committees' },
          { title: 'Task Progress', value: '--', icon: 'assignment_turned_in', trend: 'Live', subtitle: 'Completion ratio of active tasks', tone: 'blue', route: '/tasks' },
          { title: 'Upcoming Sessions', value: '--', icon: 'event_upcoming', trend: 'Live', subtitle: 'Events available for planning and follow-up', tone: 'green', route: '/events' },
          { title: 'Attendance Pulse', value: '--', icon: 'data_usage', trend: 'Live', subtitle: 'Participation quality based on attendance records', tone: 'amber', route: '/attendance' }
        ],
        miniMetrics: [],
        chartTitles: {
          events: 'Session Readiness Trend',
          attendance: 'Participation Trend'
        },
        chartData: {
          labels: [],
          eventsSeries: [],
          attendanceSeries: [],
          attendanceMax: 100
        },
        chartPalette: {
          line: '#4f46e5',
          lineFill: 'rgba(79, 70, 229, 0.16)',
          bars: ['#1d4ed8', '#2563eb', '#4338ca', '#0ea5e9', '#10b981', '#6366f1']
        },
        donut: {
          title: 'Committee Attendance',
          value: '--',
          percentage: 0,
          subtitle: 'Average attendance across records visible to your role.',
          color: '#4f46e5'
        },
        progressCards: [],
        activityTitle: 'Faculty Task Feed',
        activityItems: [],
        highlightTitle: 'Upcoming Sessions and Highlights',
        highlightItems: [],
        bottomTitle: 'Events, Tasks, and Resources',
        bottomSubtitle: 'Essential resources for committee leadership and delivery.',
        resources: [
          { title: 'Committee Roster', detail: 'View committee members, heads, and progress context.', icon: 'groups', actionLabel: 'Open Committees', route: '/committees' },
          { title: 'Event Schedule', detail: 'Track event timelines and registration readiness.', icon: 'event_note', actionLabel: 'Open Events', route: '/events' },
          { title: 'Task Board', detail: 'Review task ownership and upcoming deadlines.', icon: 'assignment', actionLabel: 'Open Tasks', route: '/tasks' }
        ]
      };
    }

    return {
      headerTitle: 'CommitteeOS Student Dashboard',
      headerSubtitle: 'Track your registered events, attendance, announcements, and personal tasks.',
      badgeLabel: 'LIVE SNAPSHOT',
      updatedAt,
      actions: {
        primaryLabel: 'View My Events',
        primaryRoute: '/student/events',
        secondaryLabel: 'Open My Tasks',
        secondaryRoute: '/student/tasks'
      },
      kpiCards: [
        { title: 'Registered Events', value: '--', icon: 'how_to_reg', trend: 'Live', subtitle: 'Events currently available for your account', tone: 'blue', route: '/student/events' },
        { title: 'Attendance Score', value: '--', icon: 'check_circle', trend: 'Live', subtitle: 'Attendance score derived from your records', tone: 'indigo', route: '/student/attendance' },
        { title: 'Announcements', value: '--', icon: 'campaign', trend: 'Live', subtitle: 'Latest announcements visible to students', tone: 'green', route: '/student/announcements' },
        { title: 'Personal Tasks', value: '--', icon: 'task_alt', trend: 'Live', subtitle: 'Open tasks currently assigned to you', tone: 'amber', route: '/student/tasks' }
      ],
      miniMetrics: [],
      chartTitles: {
        events: 'Event Participation Trend',
        attendance: 'Attendance Trend'
      },
      chartData: {
        labels: [],
        eventsSeries: [],
        attendanceSeries: [],
        attendanceMax: 100
      },
      chartPalette: {
        line: '#2563eb',
        lineFill: 'rgba(37, 99, 235, 0.16)',
        bars: ['#1d4ed8', '#2563eb', '#4f46e5', '#0ea5e9', '#60a5fa', '#6366f1']
      },
      donut: {
        title: 'Attendance Snapshot',
        value: '--',
        percentage: 0,
        subtitle: 'Personal attendance rate based on available records.',
        color: '#1d4ed8'
      },
      progressCards: [],
      activityTitle: 'Student Activity Feed',
      activityItems: [],
      highlightTitle: 'Upcoming and Important',
      highlightItems: [],
      bottomTitle: 'Events, Tasks, and Resources',
      bottomSubtitle: 'Personal resources to stay organized and prepared.',
      resources: [
        { title: 'Registered Events', detail: 'Review upcoming event schedules and details.', icon: 'event', actionLabel: 'Open Events', route: '/student/events' },
        { title: 'Attendance Ledger', detail: 'Track attendance records and your current score.', icon: 'fact_check', actionLabel: 'Open Attendance', route: '/student/attendance' },
        { title: 'Announcement Feed', detail: 'Read the latest campus and committee announcements.', icon: 'campaign', actionLabel: 'Open Announcements', route: '/student/announcements' }
      ]
    };
  }

  private getUpdatedAtLabel(): string {
    return `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  private buildActivityItems(
    role: DashboardRole,
    events: Event[],
    tasks: Task[],
    announcements: Announcement[]
  ): DashboardActivityItem[] {
    const items: DashboardActivityItem[] = [];

    const recentEvent = [...events].sort((a, b) => this.toTimestamp(b.eventDate) - this.toTimestamp(a.eventDate))[0];
    if (recentEvent) {
      items.push({
        time: this.formatRelativeLabel(recentEvent.eventDate),
        text: `${recentEvent.eventName || 'Event'} is available in the latest schedule.`,
        tone: 'success',
        icon: 'event',
        route: role === 'STUDENT' ? '/student/events' : '/events',
        meta: 'Events'
      });
    }

    const recentTask = [...tasks].sort((a, b) => this.toTimestamp(b.endDate || b.startDate) - this.toTimestamp(a.endDate || a.startDate))[0];
    if (recentTask) {
      items.push({
        time: this.formatRelativeLabel(recentTask.endDate || recentTask.startDate),
        text: `${recentTask.title || 'Task'} is currently tracked in your task board.`,
        tone: 'info',
        icon: 'task_alt',
        route: role === 'STUDENT' ? '/student/tasks' : '/tasks',
        meta: 'Tasks'
      });
    }

    const recentAnnouncement = [...announcements].sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt))[0];
    if (recentAnnouncement) {
      items.push({
        time: this.formatRelativeLabel(recentAnnouncement.createdAt),
        text: (recentAnnouncement.message || 'Announcement updated').slice(0, 120),
        tone: 'neutral',
        icon: 'campaign',
        route: role === 'STUDENT' ? '/student/announcements' : '/announcements',
        meta: 'Announcements'
      });
    }

    return items.slice(0, 4);
  }

  private buildHighlightItems(
    role: DashboardRole,
    events: Event[],
    committees: Committee[],
    announcements: Announcement[]
  ): DashboardHighlightItem[] {
    const highlights: DashboardHighlightItem[] = [];

    const upcomingEvents = [...events]
      .filter((item) => this.toTimestamp(item.eventDate) > Date.now())
      .sort((a, b) => this.toTimestamp(a.eventDate) - this.toTimestamp(b.eventDate))
      .slice(0, 2);

    upcomingEvents.forEach((item) => {
      highlights.push({
        title: item.eventName || 'Upcoming Event',
        detail: this.formatDateLabel(item.eventDate),
        status: (item.status || 'Planned').toUpperCase(),
        route: role === 'STUDENT' ? '/student/events' : '/events'
      });
    });

    if (committees.length > 0) {
      const committee = committees[0];
      highlights.push({
        title: committee.committeeName || 'Committee',
        detail: committee.facultyInchargeName || 'Faculty in-charge not assigned yet',
        status: 'Committee',
        route: role === 'STUDENT' ? '/student/committees' : '/committees'
      });
    }

    if (highlights.length < 3 && announcements.length > 0) {
      const announcement = announcements[0];
      highlights.push({
        title: 'Latest Announcement',
        detail: (announcement.message || '').slice(0, 96) || 'No announcement message available.',
        status: 'Notice',
        route: role === 'STUDENT' ? '/student/announcements' : '/announcements'
      });
    }

    return highlights.slice(0, 3);
  }

  private buildChartData(events: Event[], records: Attendance[]): DashboardChartData {
    const buckets = this.getRecentMonthBuckets(6);
    const eventsSeries = buckets.map((bucket) =>
      events.filter((item) => this.toMonthKey(item.eventDate) === bucket.key).length
    );

    const attendanceSeries = buckets.map((bucket) => {
      const monthRecords = records.filter((item) => this.toMonthKey(item.checkInTime) === bucket.key);
      if (!monthRecords.length) {
        return 0;
      }

      const presentLikeCount = monthRecords.filter((item) => this.isPresentLikeStatus(item.status)).length;
      return Math.round((presentLikeCount / monthRecords.length) * 100);
    });

    const hasData = eventsSeries.some((value) => value > 0) || attendanceSeries.some((value) => value > 0);
    if (!hasData) {
      return {
        labels: [],
        eventsSeries: [],
        attendanceSeries: [],
        attendanceMax: 100
      };
    }

    return {
      labels: buckets.map((bucket) => bucket.label),
      eventsSeries,
      attendanceSeries,
      attendanceMax: 100
    };
  }

  private mapRegistrationsToEvents(registrations: EventRegistration[]): Event[] {
    const mappedEvents = registrations
      .map((registration) => {
        const eventId = Number(registration.eventId);
        if (!Number.isFinite(eventId) || eventId <= 0) {
          return null;
        }

        return {
          id: eventId,
          eventName: registration.eventName || 'Event',
          eventDate: registration.eventDate || '',
          location: registration.eventLocation,
          registrationId: registration.id,
          registrationStatus: registration.status,
          registeredAt: registration.registeredAt,
          approvedAt: registration.approvedAt
        } as Event;
      })
      .filter((item): item is Event => !!item);

    const seen = new Set<number>();
    return mappedEvents.filter((event) => {
      const eventId = Number(event.id);
      if (!Number.isFinite(eventId) || seen.has(eventId)) {
        return false;
      }

      seen.add(eventId);
      return true;
    });
  }

  private scopeTasksForRole(role: DashboardRole, tasks: Task[], userId: number | null): Task[] {
    if (role === 'ADMIN') {
      return tasks;
    }

    if (!userId) {
      return role === 'STUDENT' ? [] : tasks;
    }

    const scopedTasks = this.scopeTasksToUser(tasks, userId);
    if (role === 'FACULTY') {
      return scopedTasks.length > 0 ? scopedTasks : tasks;
    }

    return scopedTasks;
  }

  private scopeCommitteesForRole(
    role: DashboardRole,
    committees: Committee[],
    profile: MyProfileResponse,
    userId: number | null
  ): Committee[] {
    if (role === 'ADMIN') {
      return committees;
    }

    if (role === 'STUDENT') {
      const membershipCommitteeIds = this.toNumericIds((profile.committeeMemberships || []).map((item) => item.committeeId));
      if (!membershipCommitteeIds.length) {
        return [];
      }

      return committees.filter((item) => membershipCommitteeIds.includes(Number(item.id)));
    }

    if (!userId) {
      return committees;
    }

    const scopedCommittees = committees.filter(
      (item) => Number(item.loginId) === userId || Number(item.headId) === userId
    );

    return scopedCommittees.length > 0 ? scopedCommittees : committees;
  }

  private scopeEventsForRole(
    role: DashboardRole,
    events: Event[],
    registeredEvents: Event[],
    scopedCommittees: Committee[]
  ): Event[] {
    if (role === 'STUDENT') {
      return registeredEvents;
    }

    if (role === 'ADMIN') {
      return events;
    }

    const committeeIds = this.toNumericIds(scopedCommittees.map((item) => item.id));
    if (!committeeIds.length) {
      return events;
    }

    const scopedEvents = events.filter((item) => committeeIds.includes(Number(item.committeeId)));
    return scopedEvents.length > 0 ? scopedEvents : events;
  }

  private scopeAttendanceForRole(
    role: DashboardRole,
    records: Attendance[],
    userId: number | null,
    scopedEvents: Event[]
  ): Attendance[] {
    if (role === 'ADMIN') {
      return records;
    }

    if (role === 'STUDENT') {
      return this.scopeAttendanceToUser(records, userId);
    }

    const eventIds = this.toNumericIds(scopedEvents.map((item) => item.id));
    if (!eventIds.length) {
      return records;
    }

    const scopedRecords = records.filter((item) => eventIds.includes(Number(item.eventId)));
    return scopedRecords.length > 0 ? scopedRecords : records;
  }

  private toNumericIds(values: Array<number | undefined>): number[] {
    return Array.from(new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    ));
  }

  private scopeTasksToUser(tasks: Task[], userId: number | null): Task[] {
    if (!userId) {
      return [];
    }

    const scopedTasks = tasks.filter((item) => item.assignedToId === userId || item.createdById === userId);
    return scopedTasks;
  }

  private scopeAttendanceToUser(records: Attendance[], userId: number | null): Attendance[] {
    if (!userId) {
      return [];
    }

    const scopedRecords = records.filter((item) => item.userId === userId);
    return scopedRecords;
  }

  private getAttendanceRate(records: Attendance[]): number | null {
    if (!records.length) {
      return null;
    }

    const presentLikeCount = records.filter((item) => this.isPresentLikeStatus(item.status)).length;
    return Math.round((presentLikeCount / records.length) * 100);
  }

  private getRatioPercentage(numerator: number, denominator: number): number {
    if (!denominator) {
      return 0;
    }

    return Math.round((numerator / denominator) * 100);
  }

  private countUpcomingEvents(events: Event[]): number {
    const now = Date.now();
    return events.filter((item) => this.toTimestamp(item.eventDate) > now).length;
  }

  private countRecentByDate(values: Array<string | undefined>, days: number): number {
    const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
    return values.filter((value) => this.toTimestamp(value) >= threshold).length;
  }

  private formatCount(value: number): string {
    return Number.isFinite(value) ? value.toString() : '0';
  }

  private isPresentLikeStatus(status: string | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'PRESENT' || normalized === 'LATE';
  }

  private isOpenTaskStatus(status: string | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized !== 'COMPLETED' && normalized !== 'DONE' && normalized !== 'CLOSED' && normalized !== 'CANCELLED';
  }

  private isCompletedTaskStatus(status: string | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'COMPLETED' || normalized === 'DONE' || normalized === 'CLOSED';
  }

  private normalizeStatus(value: string | undefined): string {
    return (value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  }

  private toTimestamp(value: string | undefined): number {
    if (!value) {
      return 0;
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatDateLabel(value: string | undefined): string {
    const timestamp = this.toTimestamp(value);
    if (!timestamp) {
      return 'Date not available';
    }

    return new Date(timestamp).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private formatRelativeLabel(value: string | undefined): string {
    const timestamp = this.toTimestamp(value);
    if (!timestamp) {
      return 'Now';
    }

    const diffMs = Date.now() - timestamp;
    if (diffMs < 60_000) {
      return 'Just now';
    }

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  private toMonthKey(value: string | undefined): string {
    const timestamp = this.toTimestamp(value);
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private getRecentMonthBuckets(monthCount: number): Array<{ key: string; label: string }> {
    const buckets: Array<{ key: string; label: string }> = [];
    const cursor = new Date();
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);

    for (let index = monthCount - 1; index >= 0; index -= 1) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString(undefined, { month: 'short' });
      buckets.push({ key, label });
    }

    return buckets;
  }

  private scheduleChartRender(): void {
    setTimeout(() => {
      void this.tryRenderCharts();
    }, 0);
  }

  private async tryRenderCharts(): Promise<void> {
    if (await this.renderCharts()) {
      return;
    }

    if (this.chartRenderAttempts < this.maxChartRenderAttempts) {
      this.chartRenderAttempts += 1;
      this.scheduleChartRender();
    }
  }

  private async renderCharts(): Promise<boolean> {
    if (!this.eventsTrendChart?.nativeElement || !this.attendanceChart?.nativeElement) {
      return false;
    }

    if (!(await this.ensureChartsLoaded()) || !this.chartCtor) {
      return false;
    }

    this.eventsChartRef?.destroy();
    this.attendanceChartRef?.destroy();

    const ChartCtor = this.chartCtor;
    const chartData = this.dashboardConfig.chartData;
    const palette = this.dashboardConfig.chartPalette;

    const eventsConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: this.dashboardConfig.chartTitles.events,
            data: chartData.eventsSeries,
            borderColor: palette.line,
            backgroundColor: palette.lineFill,
            tension: 0.35,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#e2e8f0' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    const attendanceConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: this.dashboardConfig.chartTitles.attendance,
            data: chartData.attendanceSeries,
            borderRadius: 8,
            backgroundColor: palette.bars
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: chartData.attendanceMax,
            ticks: { callback: (value: string | number) => `${value}%` },
            grid: { color: '#e2e8f0' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.eventsChartRef = new ChartCtor(this.eventsTrendChart.nativeElement, eventsConfig);
    this.attendanceChartRef = new ChartCtor(this.attendanceChart.nativeElement, attendanceConfig);
    return true;
  }

  private async ensureChartsLoaded(): Promise<boolean> {
    if (this.chartCtor) {
      return true;
    }

    try {
      const chartModule = await import('chart.js');
      chartModule.Chart.register(...chartModule.registerables);
      this.chartCtor = chartModule.Chart;
      return true;
    } catch {
      return false;
    }
  }

  private navigateToRoute(route?: string, fragment?: string): void {
    if (!route) {
      return;
    }

    void this.router.navigate([route], { fragment });
  }
}
