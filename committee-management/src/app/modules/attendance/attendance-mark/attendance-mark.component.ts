import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Attendance } from '../../../models/attendance.model';
import { AttendanceService } from '../../../services/attendance.service';

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

  attendanceForm = this.fb.group({
    userId: [1, Validators.required],
    eventId: [1, Validators.required],
    status: ['PRESENT', Validators.required],
    checkInTime: [''],
    remarks: ['']
  });

  constructor(private attendanceService: AttendanceService, private router: Router) {}

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
        this.router.navigate(['/attendance']);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.message || 'Unable to mark attendance. Check User ID/Event ID values.';
      }
    });
  }

}
