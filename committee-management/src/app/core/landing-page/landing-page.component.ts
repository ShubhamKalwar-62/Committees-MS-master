import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
  features = [
    {
      icon: 'groups',
      title: 'Committee Governance',
      text: 'Structured leadership, role clarity, and transparent handoffs across every committee cycle.'
    },
    {
      icon: 'event_upcoming',
      title: 'Event Operations',
      text: 'Registrations, venue planning, and execution timelines coordinated in one controlled workspace.'
    },
    {
      icon: 'school',
      title: 'Academic Accountability',
      text: 'Attendance and task performance stay measurable, auditable, and presentation-ready.'
    }
  ];

  badges = ['Role-Based Access', 'JWT Secured', 'Faculty Oversight', 'Presentation Ready'];

  stats = [
    { label: 'Active Committees', value: '08', trend: '+2 this month' },
    { label: 'Upcoming Events', value: '24', trend: '5 this week' },
    { label: 'Open Tasks', value: '17', trend: '89% on track' },
    { label: 'Attendance Today', value: '94%', trend: 'Campus average' }
  ];

  milestones = [
    { time: '09:30', item: 'Faculty committee standup' },
    { time: '11:00', item: 'Event registration sync' },
    { time: '14:00', item: 'Task board review with committee leads' }
  ];

  rolePanels = [
    {
      role: 'Admin Workspace',
      icon: 'dashboard',
      summary: 'Global visibility with control over users, events, tasks, attendance and announcements.'
    },
    {
      role: 'Faculty Workspace',
      icon: 'group',
      summary: 'Committee leadership tools for assigning tasks, validating attendance and monitoring event progress.'
    },
    {
      role: 'Student Workspace',
      icon: 'event',
      summary: 'Simple participation hub for upcoming events, personal tasks, announcements and attendance tracking.'
    }
  ];

  workflowSteps = [
    {
      step: '01',
      title: 'Plan Committees',
      text: 'Create committees, assign ownership, and define operational responsibilities.'
    },
    {
      step: '02',
      title: 'Launch Events',
      text: 'Publish event schedules, collect registrations, and coordinate execution checkpoints.'
    },
    {
      step: '03',
      title: 'Track Accountability',
      text: 'Monitor tasks, attendance metrics, and completion quality in real time.'
    },
    {
      step: '04',
      title: 'Publish Outcomes',
      text: 'Share announcements and results in a presentation-ready dashboard for review.'
    }
  ];

  moduleHighlights = [
    'Role-based dashboards',
    'Reactive auth forms',
    'Event and committee operations',
    'Task and attendance analytics',
    'Announcement broadcast center',
    'JWT-secured frontend routing'
  ];
}
