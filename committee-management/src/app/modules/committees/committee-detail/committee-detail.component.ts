import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Committee } from '../../../models/committee.model';
import { CommitteeService } from '../../../services/committee.service';

@Component({
  selector: 'app-committee-detail',
  standalone: false,
  templateUrl: './committee-detail.component.html',
  styleUrl: './committee-detail.component.css'
})
export class CommitteeDetailComponent {
  committee?: Committee;
  loading = true;
  errorMessage = '';
  requestedCommitteeId?: number;

  constructor(private route: ActivatedRoute, private committeeService: CommitteeService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.loading = true;
      this.errorMessage = '';
      this.committee = undefined;

      const id = Number(params.get('id'));
      if (!Number.isFinite(id) || id <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid committee identifier.';
        return;
      }

      this.requestedCommitteeId = id;
      this.committeeService.getCommitteeById(id).subscribe({
        next: (committee) => {
          this.loading = false;
          this.committee = committee || undefined;
          if (!this.committee) {
            this.errorMessage = 'Committee not found.';
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Unable to load committee details right now.';
        }
      });
    });
  }

}
