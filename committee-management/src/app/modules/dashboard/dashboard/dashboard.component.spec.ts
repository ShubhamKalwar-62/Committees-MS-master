import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { TaskService } from '../../../services/task.service';
import { CommitteeService } from '../../../services/committee.service';
import { AttendanceService } from '../../../services/attendance.service';
import { AnnouncementService } from '../../../services/announcement.service';
import { UserService } from '../../../services/user.service';
import { StudentOnboardingService } from '../../../services/student-onboarding.service';
import { UserStateService } from '../../../services/user-state.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let committeeServiceSpy: jasmine.SpyObj<CommitteeService>;
  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let announcementServiceSpy: jasmine.SpyObj<AnnouncementService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let studentOnboardingServiceSpy: jasmine.SpyObj<StudentOnboardingService>;
  let userStateServiceSpy: jasmine.SpyObj<UserStateService>;

  const buildComponent = async (): Promise<void> => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: CommitteeService, useValue: committeeServiceSpy },
        { provide: AttendanceService, useValue: attendanceServiceSpy },
        { provide: AnnouncementService, useValue: announcementServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: StudentOnboardingService, useValue: studentOnboardingServiceSpy },
        { provide: UserStateService, useValue: userStateServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentRole', 'getMyProfile']);
    eventServiceSpy = jasmine.createSpyObj<EventService>('EventService', ['getEvents', 'getRegistrationsForUser']);
    taskServiceSpy = jasmine.createSpyObj<TaskService>('TaskService', ['getTasks']);
    committeeServiceSpy = jasmine.createSpyObj<CommitteeService>('CommitteeService', ['getCommittees']);
    attendanceServiceSpy = jasmine.createSpyObj<AttendanceService>('AttendanceService', ['getAttendanceList']);
    announcementServiceSpy = jasmine.createSpyObj<AnnouncementService>('AnnouncementService', ['getAnnouncements']);
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers']);
    studentOnboardingServiceSpy = jasmine.createSpyObj<StudentOnboardingService>('StudentOnboardingService', ['setIsNewUser']);
    userStateServiceSpy = jasmine.createSpyObj<UserStateService>('UserStateService', ['setActivityState', 'resetActivityState']);

    authServiceSpy.getCurrentRole.and.returnValue('STUDENT');
    authServiceSpy.getMyProfile.and.returnValue(of({
      userId: 72,
      role: 'STUDENT',
      committeeMemberships: []
    } as any));

    eventServiceSpy.getEvents.and.returnValue(of([]));
    eventServiceSpy.getRegistrationsForUser.and.returnValue(of([]));
    taskServiceSpy.getTasks.and.returnValue(of([]));
    committeeServiceSpy.getCommittees.and.returnValue(of([]));
    attendanceServiceSpy.getAttendanceList.and.returnValue(of([]));
    announcementServiceSpy.getAnnouncements.and.returnValue(of([]));
    userServiceSpy.getUsers.and.returnValue(of([]));
  });

  it('should create', async () => {
    await buildComponent();
    expect(component).toBeTruthy();
  });

  it('should show onboarding and hide locked KPI cards for brand-new student', async () => {
    await buildComponent();

    expect(component.showStudentOnboarding).toBeTrue();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/tasks')).toBeFalse();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/attendance')).toBeFalse();
    expect(component.displayedResources.map((item) => item.route)).toEqual([
      '/student/events',
      '/student/committees',
      '/student/announcements'
    ]);
    expect(studentOnboardingServiceSpy.setIsNewUser).toHaveBeenCalledWith(true);
  });

  it('should unlock dashboard when student has an approved registration', async () => {
    eventServiceSpy.getRegistrationsForUser.and.returnValue(of([
      { id: 1, eventId: 1, eventName: 'Tech Event', eventDate: '2026-04-30T10:00:00', status: 'APPROVED' } as any
    ]));

    await buildComponent();

    expect(component.showStudentOnboarding).toBeFalse();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/tasks')).toBeTrue();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/attendance')).toBeTrue();
    expect(studentOnboardingServiceSpy.setIsNewUser).toHaveBeenCalledWith(false);
  });

  it('should unlock dashboard when student has committee membership even if stats are empty', async () => {
    authServiceSpy.getMyProfile.and.returnValue(of({
      userId: 72,
      role: 'STUDENT',
      committeeMemberships: [{ committeeId: 11 }]
    } as any));

    await buildComponent();

    expect(component.showStudentOnboarding).toBeFalse();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/tasks')).toBeTrue();
    expect(component.visibleKpiCards.some((card) => card.route === '/student/attendance')).toBeTrue();
    expect(studentOnboardingServiceSpy.setIsNewUser).toHaveBeenCalledWith(false);
  });

  it('should show faculty-scoped dashboard metrics', async () => {
    authServiceSpy.getCurrentRole.and.returnValue('FACULTY');
    authServiceSpy.getMyProfile.and.returnValue(of({
      userId: 99,
      role: 'FACULTY',
      committeeMemberships: []
    } as any));

    committeeServiceSpy.getCommittees.and.returnValue(of([
      { id: 11, committeeName: 'Technical Committee', loginId: 99 } as any,
      { id: 22, committeeName: 'Cultural Committee', loginId: 71 } as any
    ]));

    eventServiceSpy.getEvents.and.returnValue(of([
      { id: 101, eventName: 'Tech Sprint', committeeId: 11, eventDate: '2026-04-30T10:00:00' } as any,
      { id: 202, eventName: 'Music Fest', committeeId: 22, eventDate: '2026-04-30T10:00:00' } as any
    ]));

    taskServiceSpy.getTasks.and.returnValue(of([
      { id: 1, title: 'Prepare stage', assignedToId: 99, status: 'PENDING' } as any,
      { id: 2, title: 'Vendor sync', assignedToId: 71, status: 'PENDING' } as any
    ]));

    attendanceServiceSpy.getAttendanceList.and.returnValue(of([
      { id: 1, userId: 10, eventId: 101, status: 'PRESENT' } as any,
      { id: 2, userId: 11, eventId: 202, status: 'ABSENT' } as any
    ]));

    await buildComponent();

    expect(component.currentRole).toBe('FACULTY');
    expect(component.dashboardConfig.kpiCards[0].value).toBe('1');
    expect(component.dashboardConfig.kpiCards[2].value).toBe('1');
    expect(component.dashboardConfig.kpiCards[3].value).toBe('100%');
    expect(component.showStudentOnboarding).toBeFalse();
    expect(studentOnboardingServiceSpy.setIsNewUser).toHaveBeenCalledWith(false);
  });
});
