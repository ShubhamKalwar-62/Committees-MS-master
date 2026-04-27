import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Attendance } from '../../../models/attendance.model';
import { Event as EventModel } from '../../../models/event.model';
import { User } from '../../../models/user.model';
import { getAttendanceStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { AttendanceFilters, AttendanceService } from '../../../services/attendance.service';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { UserService } from '../../../services/user.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.css'
})
export class AttendanceListComponent {
  records: Attendance[] = [];
  events: EventModel[] = [];
  users: User[] = [];
  selectedEventId?: number;
  currentUserId: number | null = null;
  startDate = '';
  endDate = '';
  isLoading = true;
  errorMessage = '';
  private referenceDataLoaded = false;
  private hasResolvedStudentProfile = false;

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private userService: UserService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  get canMarkAttendance(): boolean {
    return this.authService.canManageCreationActions();
  }

  get canManageQrSession(): boolean {
    return this.authService.canManageCreationActions();
  }

  get canScanQrAttendance(): boolean {
    return this.authService.isStudentRole();
  }

  get attendanceBaseRoute(): string {
    return this.authService.isStudentRole() ? '/student/attendance' : '/attendance';
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const eventIdParam = Number(params.get('eventId'));
      this.selectedEventId = Number.isFinite(eventIdParam) && eventIdParam > 0 ? eventIdParam : undefined;
      this.startDate = params.get('startDate') || '';
      this.endDate = params.get('endDate') || '';

      if (!this.referenceDataLoaded) {
        this.loadReferenceData();
      }

      this.resolveUserContextAndLoadRecords();
    });
  }

  onEventFilterChange(event: globalThis.Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedEventId = Number.isFinite(value) && value > 0 ? value : undefined;
  }

  onStartDateChange(event: globalThis.Event): void {
    this.startDate = (event.target as HTMLInputElement).value || '';
  }

  onEndDateChange(event: globalThis.Event): void {
    this.endDate = (event.target as HTMLInputElement).value || '';
  }

  applyFilters(): void {
    this.loadAttendanceRecords();
  }

  clearFilters(): void {
    this.selectedEventId = undefined;
    this.startDate = '';
    this.endDate = '';
    this.loadAttendanceRecords();
  }

  get selectedEventLabel(): string | null {
    if (!this.selectedEventId) {
      return null;
    }

    const event = this.events.find((item) => Number(item.id) === this.selectedEventId);
    return event?.eventName || `Event ID ${this.selectedEventId}`;
  }

  getEventOptionLabel(event: EventModel): string {
    const dateLabel = this.formatDateTime(event.eventDate);
    return dateLabel === '-' ? event.eventName : `${event.eventName} (${dateLabel})`;
  }

  resolveUserName(item: Attendance): string {
    if (item.userName) {
      return item.userName;
    }

    const matchedUser = this.users.find((user) => Number(user.id) === Number(item.userId));
    return matchedUser?.name || `User #${item.userId}`;
  }

  resolveEventTitle(item: Attendance): string {
    if (item.eventTitle) {
      return item.eventTitle;
    }

    const matchedEvent = this.events.find((event) => Number(event.id) === Number(item.eventId));
    return matchedEvent?.eventName || `Event #${item.eventId}`;
  }

  private loadReferenceData(): void {
    forkJoin({
      events: this.eventService.getEvents().pipe(catchError(() => of([] as EventModel[]))),
      users: this.userService.getUsers().pipe(catchError(() => of([] as User[])))
    }).subscribe(({ events, users }) => {
      this.referenceDataLoaded = true;
      this.events = (events || []).filter((event) => !!event.id);
      this.users = (users || []).filter((user) => !!user.id);
    });
  }

  private loadAttendanceRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.authService.isStudentRole() && !this.currentUserId) {
      this.isLoading = false;
      this.records = [];
      this.errorMessage = 'Unable to identify your profile. Please sign in again and retry.';
      return;
    }

    this.attendanceService.getAttendanceList(this.buildFilters()).subscribe({
      next: (records) => {
        this.isLoading = false;
        this.records = records || [];
      },
      error: () => {
        this.isLoading = false;
        this.records = [];
        this.errorMessage = 'Unable to load attendance records right now. Please refresh and try again.';
      }
    });
  }

  private resolveUserContextAndLoadRecords(): void {
    if (!this.authService.isStudentRole()) {
      this.loadAttendanceRecords();
      return;
    }

    if (this.hasResolvedStudentProfile) {
      this.loadAttendanceRecords();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.currentUserId = profile.userId ?? null;
        this.hasResolvedStudentProfile = true;
        this.loadAttendanceRecords();
      },
      error: () => {
        this.currentUserId = null;
        this.hasResolvedStudentProfile = true;
        this.loadAttendanceRecords();
      }
    });
  }

  private buildFilters(): AttendanceFilters {
    const filters: AttendanceFilters = {};
    if (this.selectedEventId) {
      filters.eventId = this.selectedEventId;
    }

    if (this.authService.isStudentRole() && this.currentUserId) {
      filters.userId = this.currentUserId;
    }

    if (this.startDate) {
      filters.startDate = `${this.startDate}T00:00:00`;
    }

    if (this.endDate) {
      filters.endDate = `${this.endDate}T23:59:59`;
    }

    return filters;
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
