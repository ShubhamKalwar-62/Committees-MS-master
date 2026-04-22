import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import QRCode from 'qrcode';
import { Event } from '../../../models/event.model';
import { QrAttendanceSession } from '../../../models/qr-attendance.model';
import { AttendanceService } from '../../../services/attendance.service';
import { EventService } from '../../../services/event.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-attendance-qr-session',
  standalone: false,
  templateUrl: './attendance-qr-session.component.html',
  styleUrl: './attendance-qr-session.component.css'
})
export class AttendanceQrSessionComponent {
  events: Event[] = [];
  selectedEventId: number | null = null;
  activeSession: QrAttendanceSession | null = null;
  qrImageDataUrl = '';
  countdownLabel = '00:00';
  loadingEvents = true;
  loadingSession = false;
  startingSession = false;
  refreshingSession = false;
  endingSession = false;
  errorMessage = '';
  infoMessage = '';
  showFullscreenQr = false;

  private countdownTimerId: number | null = null;
  private refreshTimerId: number | null = null;
  private pollTimerId: number | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.stopSessionTimers();
  }

  get hasActiveSession(): boolean {
    return this.isSessionActive(this.activeSession);
  }

  onEventChange(event: globalThis.Event): void {
    const selected = Number((event.target as HTMLSelectElement).value);
    this.selectedEventId = Number.isFinite(selected) && selected > 0 ? selected : null;
  }

  startSession(): void {
    const eventId = Number(this.selectedEventId);
    if (!Number.isFinite(eventId) || eventId <= 0) {
      this.errorMessage = 'Please choose an event to start the QR attendance session.';
      return;
    }

    this.startingSession = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.attendanceService.startQrSession({ eventId, durationMinutes: 5 }).subscribe({
      next: (session) => {
        this.startingSession = false;
        this.selectedEventId = session.eventId || eventId;
        this.applySession(session);
        this.infoMessage = 'QR attendance session started successfully.';
        this.notificationService.add({
          title: 'QR Session Started',
          message: `Attendance session is live for ${session.eventName || 'the selected event'}.`,
          level: 'success',
          actionRoute: '/attendance/qr-session'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.startingSession = false;
        this.errorMessage = this.extractErrorMessage(error, 'Unable to start QR attendance session right now.');
      }
    });
  }

  refreshSession(manualTrigger = true): void {
    if (!this.activeSession || this.refreshingSession) {
      return;
    }

    this.refreshingSession = true;
    this.errorMessage = '';

    this.attendanceService.refreshQrSession(this.activeSession.sessionId, { durationSeconds: 45 }).subscribe({
      next: (session) => {
        this.refreshingSession = false;
        this.applySession(session);
        if (manualTrigger) {
          this.infoMessage = 'QR token refreshed successfully.';
        }
      },
      error: (error: HttpErrorResponse) => {
        this.refreshingSession = false;
        this.errorMessage = this.extractErrorMessage(error, 'Unable to refresh the QR token right now.');
      }
    });
  }

  endSession(): void {
    if (!this.activeSession || this.endingSession) {
      return;
    }

    this.endingSession = true;
    this.errorMessage = '';

    this.attendanceService.endQrSession(this.activeSession.sessionId).subscribe({
      next: (session) => {
        this.endingSession = false;
        this.applySession(session);
        this.infoMessage = 'QR attendance session ended.';
        this.notificationService.add({
          title: 'QR Session Ended',
          message: 'Attendance session has been closed.',
          level: 'warning',
          actionRoute: '/attendance/qr-session'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.endingSession = false;
        this.errorMessage = this.extractErrorMessage(error, 'Unable to end the QR session right now.');
      }
    });
  }

  toggleFullscreenQr(show: boolean): void {
    this.showFullscreenQr = show;
  }

  copyToken(): void {
    const token = this.activeSession?.qrToken || '';
    if (!token || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(token).then(() => {
      this.infoMessage = 'QR token copied to clipboard.';
    }).catch(() => {
      this.errorMessage = 'Unable to copy QR token automatically.';
    });
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
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getEventOptionLabel(event: Event): string {
    if (!event.eventDate) {
      return event.eventName;
    }

    const parsed = new Date(event.eventDate);
    if (Number.isNaN(parsed.getTime())) {
      return event.eventName;
    }

    const dateLabel = parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${event.eventName} (${dateLabel})`;
  }

  private loadEvents(): void {
    this.loadingEvents = true;
    this.errorMessage = '';

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.loadingEvents = false;
        this.events = (events || []).filter((event) => !!event.id);
        if (!this.selectedEventId && this.events.length > 0) {
          this.selectedEventId = this.events[0].id ?? null;
        }
      },
      error: () => {
        this.loadingEvents = false;
        this.events = [];
        this.errorMessage = 'Unable to load event options right now. Please refresh and try again.';
      }
    });
  }

  private applySession(session: QrAttendanceSession): void {
    this.activeSession = session;
    this.selectedEventId = session.eventId || this.selectedEventId;
    this.updateCountdownLabel(session.remainingSeconds);
    void this.renderQrCode(session.qrToken);

    if (this.isSessionActive(session)) {
      this.startSessionTimers();
      return;
    }

    this.stopSessionTimers();
  }

  private startSessionTimers(): void {
    this.stopSessionTimers();

    this.countdownTimerId = window.setInterval(() => {
      if (!this.activeSession) {
        return;
      }

      const nextRemaining = Math.max(this.activeSession.remainingSeconds - 1, 0);
      this.activeSession = { ...this.activeSession, remainingSeconds: nextRemaining };
      this.updateCountdownLabel(nextRemaining);

      if (nextRemaining === 0) {
        void this.fetchLatestSession();
      }
    }, 1000);

    this.refreshTimerId = window.setInterval(() => {
      if (this.isSessionActive(this.activeSession)) {
        this.refreshSession(false);
      }
    }, 45000);

    this.pollTimerId = window.setInterval(() => {
      if (this.isSessionActive(this.activeSession)) {
        void this.fetchLatestSession();
      }
    }, 10000);
  }

  private stopSessionTimers(): void {
    if (this.countdownTimerId !== null) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }

    if (this.refreshTimerId !== null) {
      clearInterval(this.refreshTimerId);
      this.refreshTimerId = null;
    }

    if (this.pollTimerId !== null) {
      clearInterval(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  private async fetchLatestSession(): Promise<void> {
    if (!this.activeSession || this.loadingSession) {
      return;
    }

    this.loadingSession = true;

    this.attendanceService.getQrSession(this.activeSession.sessionId).subscribe({
      next: (session) => {
        this.loadingSession = false;
        this.applySession(session);
      },
      error: () => {
        this.loadingSession = false;
      }
    });
  }

  private async renderQrCode(token: string): Promise<void> {
    if (!token) {
      this.qrImageDataUrl = '';
      return;
    }

    try {
      this.qrImageDataUrl = await QRCode.toDataURL(token, {
        width: 320,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
    } catch {
      this.qrImageDataUrl = '';
    }
  }

  private updateCountdownLabel(remainingSeconds: number): void {
    const safeSeconds = Number.isFinite(remainingSeconds) ? Math.max(Math.trunc(remainingSeconds), 0) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;
    this.countdownLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  private isSessionActive(session: QrAttendanceSession | null): boolean {
    if (!session) {
      return false;
    }

    if (!!session.endedAt) {
      return false;
    }

    return session.remainingSeconds > 0;
  }

  private extractErrorMessage(error: HttpErrorResponse, fallback: string): string {
    return (
      (error?.error && typeof error.error === 'object' && (error.error.message || error.error.error)) ||
      (typeof error?.error === 'string' ? error.error : '') ||
      error?.message ||
      fallback
    );
  }
}
