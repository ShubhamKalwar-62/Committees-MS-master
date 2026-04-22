import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Attendance } from '../models/attendance.model';
import { MyProfileResponse } from '../models/auth.model';
import { Event } from '../models/event.model';
import { Task } from '../models/task.model';
import { AttendanceService } from './attendance.service';
import { AuthService } from './auth.service';
import { EventService } from './event.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class StudentOnboardingService {
  private readonly isNewUserSubject = new BehaviorSubject<boolean>(false);
  private loading = false;

  readonly isNewUser$ = this.isNewUserSubject.asObservable();

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private attendanceService: AttendanceService,
    private eventService: EventService
  ) {}

  get isNewUser(): boolean {
    return this.isNewUserSubject.value;
  }

  setIsNewUser(value: boolean): void {
    this.isNewUserSubject.next(value);
  }

  refreshStatus(): void {
    const role = (this.authService.getCurrentRole() || '').toUpperCase();
    if (role !== 'STUDENT') {
      this.isNewUserSubject.next(false);
      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    this.authService.getMyProfile().pipe(
      catchError(() => of({ role: 'STUDENT' } as MyProfileResponse)),
      switchMap((profile) => {
        const userId = profile.userId || null;
        const committeeMembershipCount = (profile.committeeMemberships || []).length;

        const tasks$ = this.taskService.getTasks().pipe(
          catchError(() => of([] as Task[]))
        );

        const attendance$ = this.attendanceService.getAttendanceList().pipe(
          catchError(() => of([] as Attendance[]))
        );

        const events$ = userId
          ? this.eventService.getRegisteredEventsForUser(userId).pipe(catchError(() => of([] as Event[])))
          : of([] as Event[]);

        return combineLatest([tasks$, attendance$, events$, of(committeeMembershipCount), of(userId)]);
      })
    ).subscribe({
      next: ([tasks, attendanceRecords, events, committeeMembershipCount, userId]) => {
        const scopedTasks = this.scopeTasksToUser(tasks, userId);
        const scopedAttendance = this.scopeAttendanceToUser(attendanceRecords, userId);

        let isNewUser =
          scopedTasks.length === 0 &&
          scopedAttendance.length === 0 &&
          events.length === 0;

        if (committeeMembershipCount > 0) {
          isNewUser = false;
        }

        this.isNewUserSubject.next(isNewUser);
        this.loading = false;
      },
      error: () => {
        this.isNewUserSubject.next(false);
        this.loading = false;
      }
    });
  }

  private scopeTasksToUser(tasks: Task[], userId: number | null): Task[] {
    if (!userId) {
      return [];
    }

    return tasks.filter((task) => task.assignedToId === userId || task.createdById === userId);
  }

  private scopeAttendanceToUser(records: Attendance[], userId: number | null): Attendance[] {
    if (!userId) {
      return [];
    }

    return records.filter((record) => record.userId === userId);
  }
}
