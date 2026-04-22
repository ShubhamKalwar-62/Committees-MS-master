import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Event } from '../../../models/event.model';
import { EventRegistration, RegistrationStatus } from '../../../models/registration.model';
import { getEventStatusBadgeClass, getRegistrationStatusBadgeClass } from '../../../shared/utils/badge.utils';
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
  myRegistrations: EventRegistration[] = [];
  isLoading = true;
  isMyEventsLoading = false;
  errorMessage = '';
  myEventsErrorMessage = '';
  infoMessage = '';
  infoMessageType: 'success' | 'error' = 'success';
  currentUserId: number | null = null;
  private readonly registeringEventIds = new Set<number>();
  private readonly registrationStatusByEventId = new Map<number, RegistrationStatus>();

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
    return this.authService.isStudentRole();
  }

  get eventsBaseRoute(): string {
    return this.authService.isStudentRole() ? '/student/events' : '/events';
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.isLoading = false;
        this.events = events || [];
      },
      error: () => {
        this.isLoading = false;
        this.events = [];
        this.errorMessage = 'Unable to load events right now. Please refresh and try again.';
      }
    });

    if (this.canRegisterForEvents) {
      this.authService.getMyProfile().subscribe({
        next: (profile) => {
          this.currentUserId = profile.userId ?? null;
          this.loadMyRegistrations();
        },
        error: () => {
          this.currentUserId = null;
          this.myRegistrations = [];
          this.registrationStatusByEventId.clear();
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

    const existingStatus = this.getRegistrationStatus(eventId);
    if (existingStatus) {
      this.setInfoMessage(this.getRegistrationInfoMessage(existingStatus), 'success');
      return;
    }

    this.registeringEventIds.add(eventId);

    this.eventService.registerForEvent(eventId, this.currentUserId)
      .pipe(finalize(() => this.registeringEventIds.delete(eventId)))
      .subscribe({
        next: (res) => {
          const successMessage = res?.message || 'Registration submitted successfully.';
          this.registrationStatusByEventId.set(eventId, 'PENDING');
          this.upsertRegistration(eventId, 'PENDING');
          this.loadMyRegistrations();
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

  isRegistering(eventId: number | undefined): boolean {
    return !!eventId && this.registeringEventIds.has(eventId);
  }

  hasRegistration(eventId: number | undefined): boolean {
    return !!this.getRegistrationStatus(eventId);
  }

  getRegisterButtonLabel(eventId: number | undefined): string {
    if (this.isRegistering(eventId)) {
      return 'Registering...';
    }

    const status = this.getRegistrationStatus(eventId);
    if (status === 'APPROVED') {
      return 'Approved';
    }

    if (status === 'PENDING') {
      return 'Pending Approval';
    }

    if (status === 'REJECTED') {
      return 'Rejected';
    }

    return 'Register Now';
  }

  getRegistrationStatusLabel(status: RegistrationStatus): string {
    return status;
  }

  getRegistrationStatusBadgeClass(status: RegistrationStatus): string {
    return getRegistrationStatusBadgeClass(status);
  }

  getRegistrationStatus(eventId: number | undefined): RegistrationStatus | null {
    if (!eventId) {
      return null;
    }

    return this.registrationStatusByEventId.get(eventId) ?? null;
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

  private loadMyRegistrations(): void {
    if (!this.currentUserId) {
      this.myRegistrations = [];
      this.registrationStatusByEventId.clear();
      return;
    }

    this.isMyEventsLoading = true;
    this.myEventsErrorMessage = '';

    this.eventService.getRegistrationsForUser(this.currentUserId).subscribe({
      next: (registrations) => {
        this.isMyEventsLoading = false;
        this.myRegistrations = registrations || [];
        this.registrationStatusByEventId.clear();
        this.myRegistrations.forEach((registration) => {
          const eventId = Number(registration.eventId);
          if (Number.isFinite(eventId) && eventId > 0) {
            this.registrationStatusByEventId.set(eventId, registration.status);
          }
        });
      },
      error: () => {
        this.isMyEventsLoading = false;
        this.myRegistrations = [];
        this.registrationStatusByEventId.clear();
        this.myEventsErrorMessage = 'Unable to load your registered events right now.';
      }
    });
  }

  private upsertRegistration(eventId: number, status: RegistrationStatus): void {
    const matchedEvent = this.events.find((event) => Number(event.id) === eventId);
    const existingIndex = this.myRegistrations.findIndex((item) => Number(item.eventId) === eventId);

    const nextRegistration: EventRegistration = {
      id: existingIndex >= 0 ? this.myRegistrations[existingIndex].id : undefined,
      userId: this.currentUserId || 0,
      eventId,
      eventName: matchedEvent?.eventName || this.myRegistrations[existingIndex]?.eventName || 'Event',
      eventDate: matchedEvent?.eventDate || this.myRegistrations[existingIndex]?.eventDate,
      eventLocation: matchedEvent?.location || this.myRegistrations[existingIndex]?.eventLocation,
      registeredAt: this.myRegistrations[existingIndex]?.registeredAt,
      approvedAt: status === 'APPROVED' ? this.myRegistrations[existingIndex]?.approvedAt || null : null,
      status
    };

    if (existingIndex >= 0) {
      this.myRegistrations = this.myRegistrations.map((item, index) => index === existingIndex ? nextRegistration : item);
      return;
    }

    this.myRegistrations = [nextRegistration, ...this.myRegistrations];
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
