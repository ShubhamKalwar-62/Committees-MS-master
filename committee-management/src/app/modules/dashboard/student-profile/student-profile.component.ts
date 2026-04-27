import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, combineLatest, of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { ChangePasswordRequest, MyCommitteeMembership, MyProfileResponse } from '../../../models/auth.model';
import { TaskService } from '../../../services/task.service';
import { AttendanceService } from '../../../services/attendance.service';
import { Task } from '../../../models/task.model';
import { Attendance } from '../../../models/attendance.model';

type QuickLink = {
  label: string;
  route: string;
  icon: string;
  description: string;
  actionLabel: string;
  tone: 'blue' | 'slate' | 'rose';
};

type CommitteeItem = {
  name: string;
  role: string;
  icon: string;
  tone: 'rose' | 'indigo';
};

@Component({
  selector: 'app-student-profile',
  standalone: false,
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css'
})
export class StudentProfileComponent implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly maxPhotoSizeBytes = 1024 * 1024;
  @ViewChild('committeesSection') committeesSection?: ElementRef<HTMLElement>;

  profile: MyProfileResponse = {
    email: '',
    role: 'STUDENT',
    name: ''
  };

  loadingProfile = false;
  avatarDataUrl = '';
  profileMessage = '';
  profileMessageIsError = false;
  passwordMessage = '';
  passwordError = '';
  savingPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  attendanceRate = '--';
  openTasksCount = 0;
  participatedEventsCount = 0;
  statsLoading = false;

  readonly quickLinks: QuickLink[] = [
    {
      label: 'My Tasks',
      route: '/student/tasks',
      icon: 'task_alt',
      description: 'Check pending committee assignments and report deadlines.',
      actionLabel: 'GO TO TASKS',
      tone: 'blue'
    },
    {
      label: 'Attendance',
      route: '/student/attendance',
      icon: 'how_to_reg',
      description: 'View meeting logs and event participation records.',
      actionLabel: 'VIEW RECORDS',
      tone: 'slate'
    },
    {
      label: 'Announcements',
      route: '/student/announcements',
      icon: 'campaign',
      description: 'Stay updated with institutional notices and event alerts.',
      actionLabel: 'READ NEWS',
      tone: 'rose'
    }
  ];

  committees: CommitteeItem[] = [];

  passwordForm = this.fb.group({
    currentPassword: [''],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private taskService: TaskService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  ngAfterViewInit(): void {
    if (this.isCommitteesRoute()) {
      setTimeout(() => this.scrollToCommittees(), 0);
    }
  }

  get displayName(): string {
    const fallback = this.profile.email.includes('@') ? this.profile.email.split('@')[0] : this.profile.email;
    return (this.profile.name || fallback || 'student').trim().toLowerCase();
  }

  get profileInitial(): string {
    const source = (this.profile.name || this.profile.email || 'S').trim();
    return source ? source[0].toUpperCase() : 'S';
  }

  get workspaceTitle(): string {
    return 'Student Workspace';
  }

  get workspaceRole(): string {
    return 'Student Member';
  }

  get formattedOpenTasksCount(): string {
    return this.openTasksCount.toString().padStart(2, '0');
  }

  get participationSummary(): string {
    if (this.statsLoading) {
      return 'Syncing your latest workspace insights...';
    }

    if (this.participatedEventsCount === 0) {
      return 'No event participation records found yet for this semester.';
    }

    const eventLabel = this.participatedEventsCount === 1 ? 'event' : 'events';
    return `You have successfully participated in ${this.participatedEventsCount} ${eventLabel} this semester.`;
  }

  get academicYearLabel(): string {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startYear = now.getMonth() >= 6 ? currentYear : currentYear - 1;
    const endYearShort = String(startYear + 1).slice(-2);
    return `${startYear}-${endYearShort}`;
  }

  scrollToCommittees(): void {
    this.committeesSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getToneClasses(tone: QuickLink['tone']): string {
    if (tone === 'rose') {
      return 'bg-[#fdf2f2] border-[#f3d9de] text-[#b42338]';
    }

    if (tone === 'slate') {
      return 'bg-[#f8fafc] border-[#e2e8f0] text-[#1e3a8a]';
    }

    return 'bg-white border-[#e2e8f7] text-[#0f3f92]';
  }

  getIconToneClasses(tone: QuickLink['tone']): string {
    if (tone === 'rose') {
      return 'bg-[#f9e1e1] text-[#d44e57]';
    }

    if (tone === 'slate') {
      return 'bg-[#eaf1fb] text-[#5881b9]';
    }

    return 'bg-[#e8edfa] text-[#3f5ea8]';
  }

  getCommitteeToneClasses(tone: CommitteeItem['tone']): string {
    return tone === 'rose'
      ? 'bg-[#fce9ea] text-[#ca5962]'
      : 'bg-[#e9eefc] text-[#4563ae]';
  }

  get passwordMinLengthInvalid(): boolean {
    const control = this.passwordForm.controls.newPassword;
    return !!control.errors?.['minlength'] && (control.touched || control.dirty);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    if (!file) {
      return;
    }

    this.profileMessage = '';
    this.profileMessageIsError = false;

    if (!file.type.startsWith('image/')) {
      this.profileMessage = 'Please select a valid image file.';
      this.profileMessageIsError = true;
      input.value = '';
      return;
    }

    // Keep this stricter on the client to avoid common server-side multipart rejections.
    if (file.size > this.maxPhotoSizeBytes) {
      this.profileMessage = 'Image is too large. Please upload a file smaller than 1 MB.';
      this.profileMessageIsError = true;
      input.value = '';
      return;
    }

    this.authService.uploadMyProfilePhoto(file).subscribe({
      next: (res) => {
        this.avatarDataUrl = res?.data?.photoDataUrl || this.avatarDataUrl;
        this.profileMessage = res?.message || 'Profile photo updated successfully.';
        this.profileMessageIsError = false;
        this.notificationService.add({
          title: 'Profile Updated',
          message: this.profileMessage,
          level: 'success',
          actionRoute: '/student/profile'
        });
        input.value = '';
      },
      error: (err) => {
        this.profileMessage = this.extractApiErrorMessage(err, 'Unable to upload profile photo.');
        this.profileMessageIsError = true;
        this.notificationService.add({
          title: 'Profile Update Failed',
          message: this.profileMessage,
          level: 'error',
          actionRoute: '/student/profile'
        });
        input.value = '';
      }
    });
  }

  removePhoto(): void {
    this.authService.removeMyProfilePhoto().subscribe({
      next: (res) => {
        this.avatarDataUrl = '';
        this.profileMessage = res?.message || 'Profile photo removed.';
        this.profileMessageIsError = false;
        this.notificationService.add({
          title: 'Profile Updated',
          message: this.profileMessage,
          level: 'success',
          actionRoute: '/student/profile'
        });
      },
      error: (err) => {
        this.profileMessage = this.extractApiErrorMessage(err, 'Unable to remove profile photo.');
        this.profileMessageIsError = true;
        this.notificationService.add({
          title: 'Profile Update Failed',
          message: this.profileMessage,
          level: 'error',
          actionRoute: '/student/profile'
        });
      }
    });
  }

  onChangePassword(): void {
    this.passwordMessage = '';
    this.passwordError = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const formValue = this.passwordForm.getRawValue();
    if ((formValue.newPassword || '').length < 8) {
      this.passwordError = 'New password must be at least 8 characters long.';
      return;
    }

    const payload: ChangePasswordRequest = {
      currentPassword: formValue.currentPassword || formValue.newPassword || '',
      newPassword: formValue.newPassword || '',
      confirmPassword: formValue.confirmPassword || ''
    };

    if (payload.newPassword !== payload.confirmPassword) {
      this.passwordError = 'New password and confirm password do not match.';
      return;
    }

    this.savingPassword = true;
    this.authService.changeMyPassword(payload).subscribe({
      next: (res) => {
        this.savingPassword = false;
        this.passwordMessage = res.message || 'Password updated successfully.';
        this.notificationService.add({
          title: 'Password Updated',
          message: this.passwordMessage,
          level: 'success',
          actionRoute: '/student/profile'
        });
        this.passwordForm.reset({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        this.showNewPassword = false;
        this.showConfirmPassword = false;
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordError = this.extractApiErrorMessage(err, 'Unable to update password. Please try again.');
        this.notificationService.add({
          title: 'Password Update Failed',
          message: this.passwordError,
          level: 'error',
          actionRoute: '/student/profile'
        });
      }
    });
  }

  private extractApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Your session has expired. Please log in again.';
      }

      if (error.status === 413) {
        return 'Image is too large. Please upload a file smaller than 1 MB.';
      }

      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      const payload = error.error as { message?: string; error?: string } | null;
      if (payload?.message) {
        return payload.message;
      }

      if (payload?.error) {
        return payload.error;
      }

      if (error.message) {
        return error.message;
      }
    }

    return fallback;
  }

  private loadProfile(): void {
    this.loadingProfile = true;
    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.loadingProfile = false;
        this.profile = {
          email: profile.email || '',
          role: profile.role || 'STUDENT',
          name: profile.name || '',
          userId: profile.userId
        };
        this.avatarDataUrl = profile.photoDataUrl || '';
        this.committees = this.mapCommitteeMemberships(profile.committeeMemberships);
        this.loadWorkspaceInsights();

        if (this.isCommitteesRoute()) {
          setTimeout(() => this.scrollToCommittees(), 0);
        }
      },
      error: () => {
        this.loadingProfile = false;
        this.profile = {
          email: '',
          role: this.authService.getCurrentRole() || 'STUDENT',
          name: 'Student'
        };
        this.avatarDataUrl = '';
        this.committees = [];
        this.loadWorkspaceInsights();
      }
    });
  }

  private loadWorkspaceInsights(): void {
    this.statsLoading = true;

    combineLatest([
      this.taskService.getTasks().pipe(catchError(() => of([] as Task[]))),
      this.attendanceService.getAttendanceList(
        this.profile.userId ? { userId: this.profile.userId } : undefined
      ).pipe(catchError(() => of([] as Attendance[])))
    ]).subscribe(([tasks, records]) => {
      const scopedTasks = this.scopeTasksToCurrentStudent(tasks);
      const scopedAttendance = this.scopeAttendanceToCurrentStudent(records);

      this.openTasksCount = scopedTasks.filter((item) => this.isOpenTaskStatus(item.status)).length;

      const presentLikeRecords = scopedAttendance.filter((item) => this.isPresentLikeStatus(item.status));
      const totalRecords = scopedAttendance.length;
      this.attendanceRate = totalRecords > 0
        ? `${Math.round((presentLikeRecords.length / totalRecords) * 100)}%`
        : '--';

      const participatedEvents = new Set(
        presentLikeRecords
          .map((item) => item.eventId)
          .filter((eventId) => Number.isFinite(eventId) && eventId > 0)
      );
      this.participatedEventsCount = participatedEvents.size;
      this.statsLoading = false;
    });
  }

  private scopeTasksToCurrentStudent(tasks: Task[]): Task[] {
    const userId = this.profile.userId;
    if (!userId) {
      return tasks;
    }

    const assignedTasks = tasks.filter((item) => item.assignedToId === userId);
    return assignedTasks.length ? assignedTasks : tasks;
  }

  private scopeAttendanceToCurrentStudent(records: Attendance[]): Attendance[] {
    const userId = this.profile.userId;
    if (!userId) {
      return records;
    }

    const myRecords = records.filter((item) => item.userId === userId);
    return myRecords.length ? myRecords : records;
  }

  private isOpenTaskStatus(status: string | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized !== 'COMPLETED' && normalized !== 'DONE' && normalized !== 'CLOSED' && normalized !== 'CANCELLED';
  }

  private isPresentLikeStatus(status: string | undefined): boolean {
    const normalized = this.normalizeStatus(status);
    return normalized === 'PRESENT' || normalized === 'LATE';
  }

  private normalizeStatus(value: string | undefined): string {
    return (value || '').toUpperCase().replace(/[\s-]+/g, '_');
  }

  private isCommitteesRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/student/committees';
  }

  private mapCommitteeMemberships(memberships: MyCommitteeMembership[] | undefined): CommitteeItem[] {
    if (!memberships || memberships.length === 0) {
      return [];
    }

    return memberships
      .filter((item) => !!item?.committeeName)
      .map((item, index) => ({
        name: item.committeeName || 'Committee',
        role: item.memberRole || 'Member',
        icon: index % 2 === 0 ? 'groups' : 'workspace_premium',
        tone: index % 2 === 0 ? 'rose' : 'indigo'
      }));
  }
}
