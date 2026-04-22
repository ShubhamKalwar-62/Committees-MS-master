import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { EventRegistration } from '../../../models/registration.model';
import { getRegistrationStatusBadgeClass as resolveRegistrationStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-pending-registrations',
  standalone: false,
  templateUrl: './pending-registrations.component.html',
  styleUrl: './pending-registrations.component.css'
})
export class PendingRegistrationsComponent {
  pendingRegistrations: EventRegistration[] = [];
  isLoading = true;
  errorMessage = '';
  private readonly actionInProgressIds = new Set<number>();

  constructor(
    private eventService: EventService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPendingRegistrations();
  }

  approveRegistration(registration: EventRegistration): void {
    this.updateRegistrationStatus(registration, 'approve');
  }

  rejectRegistration(registration: EventRegistration): void {
    this.updateRegistrationStatus(registration, 'reject');
  }

  isActionInProgress(registrationId: number | undefined): boolean {
    const safeId = Number(registrationId);
    return Number.isFinite(safeId) && safeId > 0 && this.actionInProgressIds.has(safeId);
  }

  formatDate(value: string | undefined): string {
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

  getRegistrationStatusLabel(status: EventRegistration['status']): string {
    return status;
  }

  getRegistrationStatusBadgeClass(status: EventRegistration['status']): string {
    return resolveRegistrationStatusBadgeClass(status);
  }

  private loadPendingRegistrations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getPendingRegistrations().subscribe({
      next: (registrations) => {
        this.isLoading = false;
        this.pendingRegistrations = registrations || [];
      },
      error: () => {
        this.isLoading = false;
        this.pendingRegistrations = [];
        this.errorMessage = 'Unable to load pending registrations right now. Please refresh and try again.';
      }
    });
  }

  private updateRegistrationStatus(registration: EventRegistration, action: 'approve' | 'reject'): void {
    const registrationId = Number(registration.id);
    if (!Number.isFinite(registrationId) || registrationId <= 0 || this.actionInProgressIds.has(registrationId)) {
      return;
    }

    this.errorMessage = '';
    this.actionInProgressIds.add(registrationId);

    const request$ = action === 'approve'
      ? this.eventService.approveRegistration(registrationId)
      : this.eventService.rejectRegistration(registrationId);

    request$
      .pipe(finalize(() => this.actionInProgressIds.delete(registrationId)))
      .subscribe({
        next: () => {
          this.pendingRegistrations = this.pendingRegistrations.filter((item) => item.id !== registrationId);
          const actionLabel = action === 'approve' ? 'approved' : 'rejected';
          const title = action === 'approve' ? 'Registration Approved' : 'Registration Rejected';
          const eventName = registration.eventName || 'selected event';
          const studentName = registration.userName || 'student';
          this.notificationService.add({
            title,
            message: `${studentName} has been ${actionLabel} for ${eventName}.`,
            level: 'success',
            actionRoute: '/events/registrations/pending'
          });
        },
        error: (error: HttpErrorResponse) => {
          const fallback = action === 'approve'
            ? 'Unable to approve this registration right now.'
            : 'Unable to reject this registration right now.';
          const message =
            (error?.error && typeof error.error === 'object' && (error.error.message || error.error.error)) ||
            (typeof error?.error === 'string' ? error.error : '') ||
            error?.message ||
            fallback;
          this.errorMessage = message;
          this.notificationService.add({
            title: 'Registration Action Failed',
            message,
            level: 'error',
            actionRoute: '/events/registrations/pending'
          });
        }
      });
  }
}
