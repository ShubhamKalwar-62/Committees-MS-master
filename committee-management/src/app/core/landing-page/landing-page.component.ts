import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  attendanceProgress = 94;

  dashboardStats = [
    { label: 'Active Committees', value: '12', note: '+2 this month' },
    { label: 'Upcoming Events', value: '08', note: 'Next: Faculty Gala' }
  ];

  sessionList = [
    { title: 'Curriculum Review', time: '14:00', location: 'Boardroom B' }
  ];

  features = [
    {
      icon: 'groups',
      title: 'Committee Management',
      text: 'Organize member roles, terms, and mandates. Maintain historical records of all committee compositions.'
    },
    {
      icon: 'calendar_month',
      title: 'Event Operations',
      text: 'Full-cycle event lifecycle management from room booking and logistics to digital invitations.'
    },
    {
      icon: 'task_alt',
      title: 'Task Tracking',
      text: 'Assign actionable items during meetings and monitor completion with integrated deadlines and alerts.'
    },
    {
      icon: 'monitoring',
      title: 'Attendance Insights',
      text: 'Capture real-time attendance via digital check-ins and generate comprehensive participation reports.'
    }
  ];

  showcasePoints = [
    {
      title: 'Automated Minute Generation',
      detail: 'Capture notes and instantly distribute formatted minutes to all participants.'
    },
    {
      title: 'Compliance & Audit Trails',
      detail: 'Full version control and history for every committee mandate and vote.'
    },
    {
      title: 'Resource Optimization',
      detail: 'Prevent room double-bookings and manage audio-visual requirements seamlessly.'
    }
  ];
}
