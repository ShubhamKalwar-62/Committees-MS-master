import { Component } from '@angular/core';
import { Committee } from '../../../models/committee.model';
import { CommitteeService } from '../../../services/committee.service';

@Component({
  selector: 'app-committee-list',
  standalone: false,
  templateUrl: './committee-list.component.html',
  styleUrl: './committee-list.component.css'
})
export class CommitteeListComponent {
  committees: Committee[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private committeeService: CommitteeService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.committeeService.getCommittees().subscribe({
      next: (committees) => {
        this.isLoading = false;
        this.committees = committees || [];
      },
      error: () => {
        this.isLoading = false;
        this.committees = [];
        this.errorMessage = 'Unable to load committees right now. Please refresh and try again.';
      }
    });
  }

  getCommitteeRouteId(committee: Committee): number | null {
    const id = Number(committee?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  getCommitteeDescription(committee: Committee): string {
    const info = (committee?.committeeInfo || '').trim();
    if (!info) {
      return 'Committee details will be available soon.';
    }

    if (info.length <= 120) {
      return info;
    }

    return `${info.slice(0, 120)}...`;
  }

}
