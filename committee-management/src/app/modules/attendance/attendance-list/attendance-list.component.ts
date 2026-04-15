import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Attendance } from '../../../models/attendance.model';
import { getAttendanceStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
  records: Attendance[] = [];
  selectedEventId?: number;

  constructor(
    private attendanceService: AttendanceService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  get canMarkAttendance(): boolean {
    return this.authService.canManageCreationActions();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const eventIdParam = Number(params.get('eventId'));
      this.selectedEventId = Number.isFinite(eventIdParam) && eventIdParam > 0 ? eventIdParam : undefined;

      this.attendanceService.getAttendanceList().subscribe((records) => {
        this.records = this.selectedEventId
          ? records.filter((item) => item.eventId === this.selectedEventId)
          : records;
      });
    });
  }

  getAttendanceStatusBadgeClass(status: string): string {
    return getAttendanceStatusBadgeClass(status);
  }

  formatDateTime(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
