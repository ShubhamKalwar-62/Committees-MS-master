import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Attendance } from '../../../models/attendance.model';
import { AttendanceService } from '../../../services/attendance.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-attendance-mark',
  standalone: false,
  templateUrl: './attendance-mark.component.html',
  styleUrl: './attendance-mark.component.css'
})
export class AttendanceMarkComponent {
  private fb = inject(FormBuilder);

  saving = false;
  errorMessage = '';
  eventLocked = false;

  attendanceForm = this.fb.group({
    userId: [1, Validators.required],
    eventId: [1, Validators.required],
    status: ['PRESENT', Validators.required],
    checkInTime: [''],
    remarks: ['']
  });

  constructor(
    private attendanceService: AttendanceService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const eventIdParam = Number(params.get('eventId'));
      if (Number.isFinite(eventIdParam) && eventIdParam > 0) {
        this.attendanceForm.patchValue({ eventId: eventIdParam });
        this.eventLocked = true;
      } else {
        this.eventLocked = false;
      }
    });
  }

  onSubmit(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.attendanceService.markAttendance(this.attendanceForm.getRawValue() as Attendance).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.add({
          title: 'Attendance Updated',
          message: 'Attendance marked successfully.',
          level: 'success',
          actionRoute: '/attendance'
        });
        this.router.navigate(['/attendance']);
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.message || 'Unable to mark attendance. Check User ID/Event ID values.';
        this.errorMessage = message;
        this.notificationService.add({
          title: 'Attendance Update Failed',
          message,
          level: 'error',
          actionRoute: '/attendance/mark'
        });
      }
    });
  }

}
