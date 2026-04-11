import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workspace-section',
  standalone: false,
  templateUrl: './workspace-section.component.html',
  styleUrl: './workspace-section.component.css'
})
export class WorkspaceSectionComponent {
  constructor(private route: ActivatedRoute) {}

  get title(): string {
    return this.route.snapshot.data['title'] || 'Workspace Section';
  }

  get subtitle(): string {
    return this.route.snapshot.data['subtitle'] || 'Role-based module summary and recent activity.';
  }

  rows = [
    { item: 'Record 01', owner: 'Operations Team', status: 'Active', updatedAt: '10:30 AM' },
    { item: 'Record 02', owner: 'Faculty Office', status: 'In Review', updatedAt: '11:15 AM' },
    { item: 'Record 03', owner: 'Student Committee', status: 'Completed', updatedAt: '12:05 PM' },
    { item: 'Record 04', owner: 'Admin Desk', status: 'Pending', updatedAt: '02:40 PM' }
  ];
}
