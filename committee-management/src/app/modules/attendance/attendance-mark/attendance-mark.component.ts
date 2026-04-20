import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Event } from '../../../models/event.model';
import { User } from '../../../models/user.model';
import { AttendanceCreatePayload, AttendanceService } from '../../../services/attendance.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-attendance-mark',
  standalone: false,
  templateUrl: './attendance-mark.component.html',
  styleUrl: './attendance-mark.component.css'
})
export class AttendanceMarkComponent {
  private fb = inject(FormBuilder);

  events: Event[] = [];
  users: User[] = [];
  loadingOptions = true;
  saving = false;
  markAllSaving = false;
  errorMessage = '';
  eventLocked = false;

  attendanceForm = this.fb.group({
    userId: [null as number | null, Validators.required],
    eventId: [null as number | null, Validators.required],
    status: ['PRESENT', Validators.required],
    checkInTime: [this.getDefaultCheckInTime()],
    remarks: ['']
  });

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private userService: UserService,
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

    this.loadOptions();
  }

  onSubmit(): void {
    if (this.attendanceForm.invalid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      this.errorMessage = 'Please select a valid user and event.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.attendanceService.markAttendance(payload).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.add({
          title: 'Attendance Updated',
          message: 'Attendance marked successfully.',
          level: 'success',
          actionRoute: '/attendance'
        });
        this.router.navigate(['/attendance'], { queryParams: { eventId: payload.eventId } });
      },
      error: (err) => {
        this.saving = false;
        const message = err?.error?.message || 'Unable to mark attendance right now.';
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

  onMarkAllPresent(): void {
    const eventId = Number(this.attendanceForm.controls.eventId.value);
    if (!Number.isFinite(eventId) || eventId <= 0) {
      this.errorMessage = 'Please select an event before marking all users present.';
      return;
    }

    this.markAllSaving = true;
    this.errorMessage = '';
    this.attendanceService.markAllPresent(eventId, {
      checkInTime: this.attendanceForm.controls.checkInTime.value || undefined,
      remarks: this.attendanceForm.controls.remarks.value || undefined
    }).subscribe({
      next: (records) => {
        this.markAllSaving = false;
        const message = records.length
          ? `${records.length} student records marked present.`
          : 'No student users found to mark present.';
        this.notificationService.add({
          title: 'Bulk Attendance Updated',
          message,
          level: 'success',
          actionRoute: '/attendance'
        });
        this.router.navigate(['/attendance'], { queryParams: { eventId } });
      },
      error: (err) => {
        this.markAllSaving = false;
        const message = err?.error?.message || 'Unable to mark all users present right now.';
        this.errorMessage = message;
      }
    });
  }

  get canMarkAllPresent(): boolean {
    const eventId = Number(this.attendanceForm.controls.eventId.value);
    return Number.isFinite(eventId) && eventId > 0;
  }

  getEventLabel(event: Event): string {
    const dateLabel = this.resolveDateLabel(event.eventDate);
    if (!dateLabel) {
      return event.eventName;
    }

    return `${event.eventName} (${dateLabel})`;
  }

  private loadOptions(): void {
    this.loadingOptions = true;
    this.errorMessage = '';

    forkJoin({
      events: this.eventService.getEvents(),
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ events, users }) => {
        this.loadingOptions = false;
        this.events = (events || []).filter((event) => !!event.id);
        this.users = (users || []).filter((user) => !!user.id);
        this.initializeDefaultSelections();
      },
      error: () => {
        this.loadingOptions = false;
        this.events = [];
        this.users = [];
        this.errorMessage = 'Unable to load users and events. Please refresh and try again.';
      }
    });
  }

  private initializeDefaultSelections(): void {
    const eventControl = this.attendanceForm.controls.eventId;
    const userControl = this.attendanceForm.controls.userId;

    if (this.eventLocked) {
      const eventId = Number(eventControl.value);
      const exists = this.events.some((event) => Number(event.id) === eventId);
      if (!exists) {
        this.eventLocked = false;
        eventControl.setValue(this.events[0]?.id ?? null);
      }
    } else if (!eventControl.value && this.events.length > 0) {
      eventControl.setValue(this.events[0].id ?? null);
    }

    if (!userControl.value && this.users.length > 0) {
      userControl.setValue(this.users[0].id ?? null);
    }
  }

  private buildPayload(): AttendanceCreatePayload | null {
    const raw = this.attendanceForm.getRawValue();
    const userId = Number(raw.userId);
    const eventId = Number(raw.eventId);

    if (!Number.isFinite(userId) || userId <= 0 || !Number.isFinite(eventId) || eventId <= 0) {
      return null;
    }

    return {
      userId,
      eventId,
      status: raw.status || 'PRESENT',
      checkInTime: raw.checkInTime || undefined,
      remarks: raw.remarks || undefined
    };
  }

  private getDefaultCheckInTime(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private resolveDateLabel(rawDate: string | undefined): string {
    if (!rawDate) {
      return '';
    }

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

}
