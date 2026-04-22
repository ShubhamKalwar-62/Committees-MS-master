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

  rows: Array<{ item: string; owner: string; status: string; updatedAt: string }> = [];
}
