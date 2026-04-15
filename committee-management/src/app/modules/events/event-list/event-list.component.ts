import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Event } from '../../../models/event.model';
import { getEventStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-event-list',
  standalone: false,
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent {
  events: Event[] = [];
  infoMessage = '';
  infoMessageType: 'success' | 'error' = 'success';
  currentUserId: number | null = null;
  private readonly registeringEventIds = new Set<number>();

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get canCreateEvent(): boolean {
    return this.authService.canManageCreationActions();
  }

  get isAdmin(): boolean {
    return this.authService.getCurrentRole() === 'ADMIN';
  }

  get canRegisterForEvents(): boolean {
    return !this.isAdmin;
  }

  get eventsBaseRoute(): string {
    return this.authService.isStudentRole() ? '/student/events' : '/events';
  }

  ngOnInit(): void {
    this.eventService.getEvents().subscribe((events) => (this.events = events));

    if (this.canRegisterForEvents) {
      this.authService.getMyProfile().subscribe({
        next: (profile) => {
          this.currentUserId = profile.userId ?? null;
        },
        error: () => {
          this.currentUserId = null;
        }
      });
    }
  }

  register(eventId: number | undefined): void {
    if (this.isAdmin) {
      return;
    }

    if (!eventId) {
      return;
    }

    if (!this.currentUserId) {
      this.setInfoMessage('Unable to identify your account. Refresh the page and try again.', 'error');
      return;
    }

    if (this.registeringEventIds.has(eventId)) {
      return;
    }

    this.registeringEventIds.add(eventId);

    this.eventService.registerForEvent(eventId, this.currentUserId)
      .pipe(finalize(() => this.registeringEventIds.delete(eventId)))
      .subscribe({
        next: (res) => {
          const successMessage = res?.message || 'Registration submitted successfully.';
          this.setInfoMessage(successMessage, 'success');
          this.notificationService.add({
            title: 'Event Registration Confirmed',
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

  isRegistering(eventId: number | undefined): boolean {
    return !!eventId && this.registeringEventIds.has(eventId);
  }

  formatEventDate(value: string): string {
    if (!value) {
      return 'Date not available';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getEventPreview(description: string | undefined): string {
    const normalized = (description || '').trim();
    if (!normalized) {
      return 'No event description has been provided yet.';
    }

    if (normalized.length <= 120) {
      return normalized;
    }

    return `${normalized.slice(0, 120)}...`;
  }

  getEventStatusBadgeClass(status: string | undefined): string {
    return getEventStatusBadgeClass(status);
  }

  private setInfoMessage(message: string, type: 'success' | 'error'): void {
    this.infoMessage = message;
    this.infoMessageType = type;
  }

  private extractRegisterErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Your session has expired. Please log in again and retry.';
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
