import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Event } from '../../../models/event.model';
import { RegistrationStatus } from '../../../models/registration.model';
import { getEventStatusBadgeClass, getRegistrationStatusBadgeClass as resolveRegistrationStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-event-detail',
  standalone: false,
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
  event?: Event;
  loading = true;
  errorMessage = '';
  infoMessage = '';
  infoMessageType: 'success' | 'error' = 'success';
  registering = false;
  requestedEventId?: number;
  currentUserId: number | null = null;
  registrationStatus: RegistrationStatus | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get eventsBaseRoute(): string {
    return this.authService.isStudentRole() ? '/student/events' : '/events';
  }

  get canRegisterForEvents(): boolean {
    return this.authService.isStudentRole();
  }

  get hasRegistrationStatus(): boolean {
    return !!this.registrationStatus;
  }

  get registerButtonLabel(): string {
    if (this.registering) {
      return 'Registering...';
    }

    if (this.registrationStatus === 'APPROVED') {
      return 'Approved';
    }

    if (this.registrationStatus === 'PENDING') {
      return 'Pending Approval';
    }

    if (this.registrationStatus === 'REJECTED') {
      return 'Rejected';
    }

    return 'Register Now';
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.loading = true;
      this.errorMessage = '';
      this.infoMessage = '';
      this.event = undefined;
      this.registrationStatus = null;
      this.currentUserId = null;

      const id = Number(params.get('id'));
      if (!Number.isFinite(id) || id <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid event identifier.';
        return;
      }

      this.requestedEventId = id;
      if (this.canRegisterForEvents) {
        this.loadStudentRegistrationStatus(id);
      }

      this.eventService.getEventById(id).subscribe({
        next: (event) => {
          this.loading = false;
          this.event = event || undefined;
          if (!this.event) {
            this.errorMessage = 'Event not found.';
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Unable to load event details right now.';
        }
      });
    });
  }

  registerForEvent(): void {
    if (!this.canRegisterForEvents || this.registering) {
      return;
    }

    const eventId = Number(this.requestedEventId ?? this.event?.id);
    if (!Number.isFinite(eventId) || eventId <= 0) {
      this.setInfoMessage('Invalid event identifier.', 'error');
      return;
    }

    if (!this.currentUserId) {
      this.setInfoMessage('Unable to identify your account. Refresh the page and try again.', 'error');
      return;
    }

    if (this.registrationStatus) {
      this.setInfoMessage(this.getRegistrationInfoMessage(this.registrationStatus), 'success');
      return;
    }

    this.registering = true;
    this.infoMessage = '';

    this.eventService.registerForEvent(eventId, this.currentUserId)
      .pipe(finalize(() => {
        this.registering = false;
      }))
      .subscribe({
        next: (response) => {
          const successMessage = response?.message || 'Registration submitted successfully.';
          this.registrationStatus = 'PENDING';
          this.setInfoMessage(successMessage, 'success');
          this.notificationService.add({
            title: 'Registration Submitted',
            message: successMessage,
            level: 'success',
            actionRoute: this.eventsBaseRoute
          });
        },
        error: (error: HttpErrorResponse) => {
          const message = this.extractRegisterErrorMessage(error);
          this.setInfoMessage(message, 'error');
          this.notificationService.add({
            title: 'Event Registration Failed',
            message,
            level: 'error',
            actionRoute: this.eventsBaseRoute
          });
        }
      });
  }

  getStatusBadgeClass(status: string | undefined): string {
    return getEventStatusBadgeClass(status);
  }

  getRegistrationStatusBadgeClass(status: RegistrationStatus): string {
    return resolveRegistrationStatusBadgeClass(status);
  }

  getRegistrationStatusLabel(status: RegistrationStatus): string {
    return status;
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
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private loadStudentRegistrationStatus(eventId: number): void {
    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.currentUserId = profile.userId ?? null;
        if (!this.currentUserId) {
          this.registrationStatus = null;
          return;
        }

        this.eventService.getRegistrationsForUser(this.currentUserId).subscribe({
          next: (registrations) => {
            const match = (registrations || []).find((item) => Number(item.eventId) === eventId);
            this.registrationStatus = match?.status ?? null;
          },
          error: () => {
            this.registrationStatus = null;
          }
        });
      },
      error: () => {
        this.currentUserId = null;
        this.registrationStatus = null;
      }
    });
  }

  private setInfoMessage(message: string, type: 'success' | 'error'): void {
    this.infoMessage = message;
    this.infoMessageType = type;
  }

  private getRegistrationInfoMessage(status: RegistrationStatus): string {
    if (status === 'APPROVED') {
      return 'You are already approved for this event.';
    }

    if (status === 'PENDING') {
      return 'Your registration is pending approval.';
    }

    return 'Your previous request was rejected. Please contact faculty for assistance.';
  }

  private extractRegisterErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again and retry.';
    }

    if (error.status === 409) {
      return 'You are already registered for this event.';
    }

    if (error.status === 403) {
      return 'Your account is not allowed to register for this event. If this continues, ask admin to verify event registration permissions.';
    }

    return (
      (error?.error && typeof error.error === 'object' && (error.error.message || error.error.error)) ||
      (typeof error?.error === 'string' ? error.error : '') ||
      error?.message ||
      'Unable to register for this event right now.'
    );
  }

}
