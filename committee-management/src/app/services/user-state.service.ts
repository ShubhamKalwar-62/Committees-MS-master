import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type UserActivityState = {
  hasEvents: boolean;
  hasTasks: boolean;
  hasAttendance: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly hasEventsSubject = new BehaviorSubject<boolean>(false);
  private readonly hasTasksSubject = new BehaviorSubject<boolean>(false);
  private readonly hasAttendanceSubject = new BehaviorSubject<boolean>(false);

  readonly hasEvents$ = this.hasEventsSubject.asObservable();
  readonly hasTasks$ = this.hasTasksSubject.asObservable();
  readonly hasAttendance$ = this.hasAttendanceSubject.asObservable();

  get hasEvents(): boolean {
    return this.hasEventsSubject.value;
  }

  get hasTasks(): boolean {
    return this.hasTasksSubject.value;
  }

  get hasAttendance(): boolean {
    return this.hasAttendanceSubject.value;
  }

  setActivityState(state: Partial<UserActivityState>): void {
    if (state.hasEvents !== undefined) {
      this.hasEventsSubject.next(!!state.hasEvents);
    }

    if (state.hasTasks !== undefined) {
      this.hasTasksSubject.next(!!state.hasTasks);
    }

    if (state.hasAttendance !== undefined) {
      this.hasAttendanceSubject.next(!!state.hasAttendance);
    }
  }

  resetActivityState(): void {
    this.hasEventsSubject.next(false);
    this.hasTasksSubject.next(false);
    this.hasAttendanceSubject.next(false);
  }
}
