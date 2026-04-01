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

  constructor(private committeeService: CommitteeService) {}

  ngOnInit(): void {
    this.committeeService.getCommittees().subscribe((committees) => {
      this.committees = committees;
    });
  }

}
