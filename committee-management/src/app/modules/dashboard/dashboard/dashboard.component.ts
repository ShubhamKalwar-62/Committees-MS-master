import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AuthService } from '../../../services/auth.service';

Chart.register(...registerables);

type DashboardCard = {
  title: string;
  value: string;
  icon: string;
  color: string;
};

type DashboardConfig = {
  heading: string;
  subheading: string;
  cards: DashboardCard[];
  timeline: Array<{ time: string; text: string }>;
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

  private readonly configByRole: Record<string, DashboardConfig> = {
    ADMIN: {
      heading: 'Admin Control Dashboard',
      subheading: 'Full-system visibility across committees, events, tasks, and attendance.',
      cards: [
        { title: 'Total Events', value: '124', icon: 'event', color: '#2563eb' },
        { title: 'Active Committees', value: '18', icon: 'groups', color: '#22c55e' },
        { title: 'Open Tasks', value: '47', icon: 'assignment', color: '#f59e0b' },
        { title: 'Attendance Today', value: '91%', icon: 'fact_check', color: '#0ea5e9' }
      ],
      timeline: [
        { time: '09:10', text: 'Committee audit report generated' },
        { time: '11:00', text: 'New event approved by admin office' },
        { time: '14:20', text: 'Attendance sync completed' },
        { time: '16:35', text: 'Announcement sent to all users' }
      ]
    },
    FACULTY: {
      heading: 'Faculty Operations Dashboard',
      subheading: 'Monitor assigned committees, track tasks, and improve student attendance.',
      cards: [
        { title: 'Assigned Committees', value: '06', icon: 'apartment', color: '#2563eb' },
        { title: 'Upcoming Events', value: '09', icon: 'event_upcoming', color: '#22c55e' },
        { title: 'Task Overview', value: '31', icon: 'task_alt', color: '#f59e0b' },
        { title: 'Attendance Summary', value: '88%', icon: 'analytics', color: '#0ea5e9' }
      ],
      timeline: [
        { time: '08:45', text: 'Faculty briefing for committee heads' },
        { time: '12:15', text: 'Task assignment updated for events team' },
        { time: '15:00', text: 'Attendance exceptions reviewed' },
        { time: '17:10', text: 'Announcement draft shared with admin' }
      ]
    },
    STUDENT: {
      heading: 'Student Participation Dashboard',
      subheading: 'Stay on top of your events, tasks, and attendance performance.',
      cards: [
        { title: 'Upcoming Events', value: '04', icon: 'event', color: '#2563eb' },
        { title: 'Registered Events', value: '11', icon: 'how_to_reg', color: '#22c55e' },
        { title: 'Task Status', value: '07 open', icon: 'assignment_turned_in', color: '#f59e0b' },
        { title: 'Attendance', value: '92%', icon: 'check_circle', color: '#0ea5e9' }
      ],
      timeline: [
        { time: '09:00', text: 'Checked in for morning seminar' },
        { time: '11:30', text: 'Submitted event coordination task' },
        { time: '13:40', text: 'Registered for hackathon workshop' },
        { time: '16:20', text: 'Read latest committee announcement' }
      ]
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
      this.renderCharts();
    }, 350);
  }

  ngOnDestroy(): void {
    this.eventsChartRef?.destroy();
    this.attendanceChartRef?.destroy();
  }

  private renderCharts(): void {
    if (!this.eventsTrendChart?.nativeElement || !this.attendanceChart?.nativeElement) {
      return;
    }

    this.eventsChartRef?.destroy();
    this.attendanceChartRef?.destroy();

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

    this.eventsChartRef = new Chart(this.eventsTrendChart.nativeElement, eventsConfig);
    this.attendanceChartRef = new Chart(this.attendanceChart.nativeElement, attendanceConfig);
  }
}
