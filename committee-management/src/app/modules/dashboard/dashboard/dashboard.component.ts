import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats = [
    { title: 'Total Events', value: 24, route: '/events' },
    { title: 'Active Committees', value: 8, route: '/committees' },
    { title: 'Open Tasks', value: 17, route: '/tasks' },
    { title: 'Today Attendance', value: 132, route: '/attendance' }
  ];

  activity = [
    { label: 'Event Registrations', value: 72, color: '#1f7a8c' },
    { label: 'Tasks Completed', value: 54, color: '#2a9d8f' },
    { label: 'Attendance Rate', value: 88, color: '#e9c46a' },
    { label: 'Announcements Read', value: 63, color: '#f4a261' }
  ];

  get maxActivity(): number {
    return Math.max(...this.activity.map((item) => item.value), 1);
  }

  getBarWidth(value: number): number {
    return (value / this.maxActivity) * 100;
  }
}
