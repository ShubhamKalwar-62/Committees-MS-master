import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import type { Chart, ChartConfiguration } from 'chart.js';
import { AuthService } from '../../../services/auth.service';

type DashboardCard = {
  title: string;
  value: string;
  icon: string;
  color: string;
  subtitle: string;
};

type SummaryBadge = {
  label: string;
  value: string;
};

type TimelineTone = 'info' | 'success' | 'warning' | 'neutral';

type DashboardTimelineItem = {
  time: string;
  text: string;
  tone: TimelineTone;
};

type EventHighlight = {
  title: string;
  schedule: string;
  venue: string;
  status: string;
};

type FeaturedInstitution = {
  name: string;
  location: string;
  profile: string;
  coverage: number;
  committees: string;
  focus: string[];
};

type DashboardConfig = {
  heading: string;
  subheading: string;
  cards: DashboardCard[];
  summaryBadges: SummaryBadge[];
  timeline: DashboardTimelineItem[];
  eventHighlights: EventHighlight[];
  featuredInstitution: FeaturedInstitution;
};

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('eventsTrendChart') eventsTrendChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('attendanceChart') attendanceChart?: ElementRef<HTMLCanvasElement>;

  loading = true;

  private eventsChartRef?: Chart;
  private attendanceChartRef?: Chart;
  private chartCtor?: typeof import('chart.js').Chart;
  private chartRenderAttempts = 0;
  private readonly maxChartRenderAttempts = 10;

  private readonly configByRole: Record<string, DashboardConfig> = {
    ADMIN: {
      heading: 'CommitteeOS Admin Dashboard',
      subheading: 'Full-system visibility across committees, events, and attendance.',
      cards: [
        { title: 'Total Events', value: '124', icon: 'event', color: '#2563eb', subtitle: 'Published this semester' },
        { title: 'Active Committees', value: '18', icon: 'groups', color: '#22c55e', subtitle: 'Currently operational' },
        { title: 'Attendance Today', value: '91%', icon: 'fact_check', color: '#0ea5e9', subtitle: 'Campus participation rate' },
        { title: 'Open Approvals', value: '12', icon: 'approval', color: '#f59e0b', subtitle: 'Requests awaiting review' }
      ],
      summaryBadges: [
        { label: 'Registered Members', value: '1,462' },
        { label: 'Budget Utilization', value: '74%' },
        { label: 'Escalations', value: '3 active' }
      ],
      timeline: [
        { time: '09:10', text: 'Committee audit report generated', tone: 'info' },
        { time: '11:00', text: 'New event approved by admin office', tone: 'success' },
        { time: '13:30', text: 'Finance team flagged venue invoice mismatch', tone: 'warning' },
        { time: '14:20', text: 'Attendance sync completed', tone: 'neutral' }
      ],
      eventHighlights: [
        { title: 'Tech Symposium', schedule: 'Apr 14, 10:00 AM', venue: 'Main Auditorium', status: 'On Track' },
        { title: 'Placement Workshop', schedule: 'Apr 18, 02:00 PM', venue: 'Seminar Hall', status: 'Registration Open' },
        { title: 'Annual Cultural Fest', schedule: 'Apr 22, 05:00 PM', venue: 'Open Air Theatre', status: 'Vendor Review' }
      ],
      featuredInstitution: {
        name: 'Central Technical Campus',
        location: 'Innovation District, Block A',
        profile: 'Institution health score combining attendance, event quality, and committee output.',
        coverage: 86,
        committees: '18 active committees',
        focus: ['Research Expo', 'Innovation Cell', 'Leadership Summit']
      }
    },
    FACULTY: {
      heading: 'CommitteeOS Faculty Dashboard',
      subheading: 'Monitor assigned committees, track tasks, and improve student attendance.',
      cards: [
        { title: 'Assigned Committees', value: '06', icon: 'apartment', color: '#2563eb', subtitle: 'You currently supervise' },
        { title: 'Upcoming Events', value: '09', icon: 'event_upcoming', color: '#22c55e', subtitle: 'Scheduled in your track' },
        { title: 'Task Overview', value: '31', icon: 'task_alt', color: '#f59e0b', subtitle: 'Pending team actions' },
        { title: 'Attendance Summary', value: '88%', icon: 'analytics', color: '#0ea5e9', subtitle: 'Average weekly adherence' }
      ],
      summaryBadges: [
        { label: 'Class Coordinators', value: '12' },
        { label: 'Mentor Meetings', value: '27 this week' },
        { label: 'Action Items Closed', value: '82%' }
      ],
      timeline: [
        { time: '08:45', text: 'Faculty briefing for committee heads', tone: 'info' },
        { time: '12:15', text: 'Task assignment updated for events team', tone: 'success' },
        { time: '15:00', text: 'Attendance exceptions reviewed', tone: 'warning' },
        { time: '17:10', text: 'Announcement draft shared with admin', tone: 'neutral' }
      ],
      eventHighlights: [
        { title: 'Department Colloquium', schedule: 'Apr 12, 11:00 AM', venue: 'Conference Room 3', status: 'Confirmed' },
        { title: 'Capstone Showcase', schedule: 'Apr 19, 01:30 PM', venue: 'Lab Complex', status: 'Prep Ongoing' },
        { title: 'Mentor Connect Day', schedule: 'Apr 24, 09:00 AM', venue: 'Lecture Hall 2', status: 'Assignments Shared' }
      ],
      featuredInstitution: {
        name: 'School of Applied Sciences',
        location: 'Academic Circle, East Wing',
        profile: 'Faculty performance pulse blending committee delivery and mentoring completion.',
        coverage: 79,
        committees: '6 supervised committees',
        focus: ['Curriculum Sprint', 'Industry Mentorship', 'Assessment Audit']
      }
    },
    STUDENT: {
      heading: 'CommitteeOS Student Dashboard',
      subheading: 'Stay on top of your events, tasks, and attendance performance.',
      cards: [
        { title: 'Upcoming Events', value: '04', icon: 'event', color: '#2563eb', subtitle: 'Next activities this week' },
        { title: 'Registered Events', value: '11', icon: 'how_to_reg', color: '#22c55e', subtitle: 'Confirmed participation slots' },
        { title: 'Task Status', value: '07 open', icon: 'assignment_turned_in', color: '#f59e0b', subtitle: 'Assignments awaiting closure' },
        { title: 'Attendance', value: '92%', icon: 'check_circle', color: '#0ea5e9', subtitle: 'Current participation score' }
      ],
      summaryBadges: [
        { label: 'Team Collaborations', value: '14' },
        { label: 'Credits Earned', value: '9 this term' },
        { label: 'Deadlines This Week', value: '5' }
      ],
      timeline: [
        { time: '09:00', text: 'Checked in for morning seminar', tone: 'success' },
        { time: '11:30', text: 'Submitted event coordination task', tone: 'info' },
        { time: '13:40', text: 'Registered for hackathon workshop', tone: 'success' },
        { time: '16:20', text: 'Read latest committee announcement', tone: 'neutral' }
      ],
      eventHighlights: [
        { title: 'Hackathon Bootcamp', schedule: 'Apr 13, 04:00 PM', venue: 'Innovation Hub', status: 'Enrolled' },
        { title: 'Design Sprint', schedule: 'Apr 16, 03:00 PM', venue: 'Studio Lab', status: 'Seats Filling Fast' },
        { title: 'Community Outreach', schedule: 'Apr 20, 08:30 AM', venue: 'City Center', status: 'Volunteer Slot Open' }
      ],
      featuredInstitution: {
        name: 'Student Innovation Forum',
        location: 'Collaborative Commons, Level 2',
        profile: 'Participation meter based on event contribution, task closures, and attendance consistency.',
        coverage: 92,
        committees: '11 registered activities',
        focus: ['Hackathon Track', 'Startup Circle', 'Social Impact Lab']
      }
    }
  };

  constructor(private authService: AuthService) {}

  get role(): string {
    return this.authService.getCurrentRole() || 'STUDENT';
  }

  get dashboardConfig(): DashboardConfig {
    return this.configByRole[this.role] || this.configByRole['STUDENT'];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loading = false;
      this.scheduleChartRender();
    }, 350);
  }

  ngOnDestroy(): void {
    this.eventsChartRef?.destroy();
    this.attendanceChartRef?.destroy();
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

    const eventsConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [
          {
            label: 'Events Trend',
            data: [6, 9, 7, 10, 12, 8],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            tension: 0.32,
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
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Attendance %',
            data: [82, 86, 91, 89],
            borderRadius: 8,
            backgroundColor: ['#2563eb', '#1d4ed8', '#22c55e', '#0ea5e9']
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
            max: 100,
            ticks: { callback: (value) => `${value}%` },
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

  getCardValueByKeyword(keyword: string): string {
    const normalizedKeyword = (keyword || '').toLowerCase();
    const card = this.dashboardConfig.cards.find((item) => item.title.toLowerCase().includes(normalizedKeyword));
    return card?.value || '--';
  }

  getCardPulseWidth(rawValue: string): string {
    const numeric = this.parsePercent(rawValue);
    const bounded = Math.max(20, Math.min(100, numeric || 38));
    return `${bounded}%`;
  }

  getRelativeFeedTime(index: number): string {
    const labels = ['Just now', '12 min ago', '29 min ago', '1 hr ago', 'Earlier'];
    return labels[index] || 'Earlier';
  }

  getTimelineToneClass(tone: TimelineTone): string {
    switch (tone) {
      case 'success':
        return 'feed-marker-success';
      case 'warning':
        return 'feed-marker-warning';
      case 'info':
        return 'feed-marker-info';
      default:
        return 'feed-marker-neutral';
    }
  }

  getCoverageRingStyle(value: number): string {
    const bounded = Math.max(0, Math.min(100, value));
    return `conic-gradient(#93c5fd 0 ${bounded}%, rgba(255, 255, 255, 0.24) ${bounded}% 100%)`;
  }

  getTimelineIcon(text: string): string {
    const normalized = (text || '').toLowerCase();
    if (normalized.includes('attendance')) {
      return 'fact_check';
    }
    if (normalized.includes('event') || normalized.includes('seminar') || normalized.includes('workshop')) {
      return 'event';
    }
    if (normalized.includes('task') || normalized.includes('assignment')) {
      return 'task_alt';
    }
    if (normalized.includes('announcement')) {
      return 'campaign';
    }
    if (normalized.includes('committee')) {
      return 'groups';
    }
    return 'schedule';
  }

  private parsePercent(rawValue: string): number {
    const matched = (rawValue || '').match(/\d+/);
    if (!matched) {
      return 0;
    }

    return Number(matched[0]);
  }
}
