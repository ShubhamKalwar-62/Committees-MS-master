/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { CommitteeService } from '../../services/committee.service';
import { EventService } from '../../services/event.service';
import { NotificationService } from '../../services/notification.service';
import { StudentOnboardingService } from '../../services/student-onboarding.service';
import { TaskService } from '../../services/task.service';
import { UserStateService } from '../../services/user-state.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let committeeServiceSpy: jasmine.SpyObj<CommitteeService>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let studentOnboardingServiceSpy: jasmine.SpyObj<StudentOnboardingService>;
  let userStateServiceSpy: jasmine.SpyObj<UserStateService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'getCurrentRole', 'getRoleHomeRoute', 'logout']);
    eventServiceSpy = jasmine.createSpyObj<EventService>('EventService', ['getEvents']);
    committeeServiceSpy = jasmine.createSpyObj<CommitteeService>('CommitteeService', ['getCommittees']);
    taskServiceSpy = jasmine.createSpyObj<TaskService>('TaskService', ['getTasks']);
    notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['markAsRead', 'markAllAsRead', 'remove', 'clearAll'], {
      notifications$: of([])
    });
    studentOnboardingServiceSpy = jasmine.createSpyObj<StudentOnboardingService>('StudentOnboardingService', ['refreshStatus'], {
      isNewUser$: of(true)
    });
    userStateServiceSpy = jasmine.createSpyObj<UserStateService>('UserStateService', [], {
      hasEvents$: of(false),
      hasTasks$: of(false),
      hasAttendance$: of(false)
    });

    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getCurrentRole.and.returnValue('STUDENT');
    authServiceSpy.getRoleHomeRoute.and.returnValue('/student/dashboard');
    eventServiceSpy.getEvents.and.returnValue(of([]));
    committeeServiceSpy.getCommittees.and.returnValue(of([]));
    taskServiceSpy.getTasks.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: EventService, useValue: eventServiceSpy },
        { provide: CommitteeService, useValue: committeeServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: StudentOnboardingService, useValue: studentOnboardingServiceSpy },
        { provide: UserStateService, useValue: userStateServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should lock student tasks and attendance in new-user mode', () => {
    component.isNewUser = true;

    expect(component.isMenuItemLocked({ route: '/student/tasks' })).toBeTrue();
    expect(component.isMenuItemLocked({ route: '/student/attendance' })).toBeTrue();
    expect(component.isMenuItemLocked({ route: '/student/events' })).toBeFalse();
  });

  it('should expose lock tooltip only for locked items', () => {
    component.isNewUser = true;

    expect(component.getMenuItemLockTooltip({ route: '/student/tasks' })).toBe('Complete onboarding to unlock');
    expect(component.getMenuItemLockTooltip({ route: '/student/events' })).toBeNull();
  });

  it('should not lock items once onboarding is complete', () => {
    component.isNewUser = false;

    expect(component.isMenuItemLocked({ route: '/student/tasks' })).toBeFalse();
    expect(component.getMenuItemLockTooltip({ route: '/student/tasks' })).toBeNull();
  });

  it('should search across events, committees, and tasks', () => {
    eventServiceSpy.getEvents.and.returnValue(of([
      { id: 101, eventName: 'Hack Summit', eventDate: '2026-05-01T10:00:00', location: 'Main Hall' } as any
    ]));
    committeeServiceSpy.getCommittees.and.returnValue(of([
      { id: 202, committeeName: 'Hack Committee', facultyInchargeName: 'Dr. Sharma' } as any
    ]));
    taskServiceSpy.getTasks.and.returnValue(of([
      { id: 303, title: 'Hack prep checklist', status: 'PENDING', priority: 'HIGH' } as any
    ]));

    component.onSearchFocus('desktop');
    component.onSearchInput({ target: { value: 'hack' } } as unknown as Event);

    expect(component.filteredSearchResults.some((result) => result.type === 'EVENT')).toBeTrue();
    expect(component.filteredSearchResults.some((result) => result.type === 'COMMITTEE')).toBeTrue();
    expect(component.filteredSearchResults.some((result) => result.type === 'TASK')).toBeTrue();
    expect(component.searchSections.map((section) => section.title)).toEqual(['Events', 'Committees', 'Tasks']);
  });

  it('should navigate and reset state when a search result is clicked', () => {
    eventServiceSpy.getEvents.and.returnValue(of([
      { id: 555, eventName: 'Tech Expo', eventDate: '2026-06-01T09:00:00', location: 'Auditorium' } as any
    ]));
    committeeServiceSpy.getCommittees.and.returnValue(of([]));
    taskServiceSpy.getTasks.and.returnValue(of([]));

    const navigateByUrlSpy = spyOn((component as any).router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.onSearchFocus('desktop');
    component.onSearchInput({ target: { value: 'tech' } } as unknown as Event);

    const firstResult = component.filteredSearchResults[0];
    component.onSearchResultClick(firstResult);

    expect(navigateByUrlSpy).toHaveBeenCalledWith(firstResult.route);
    expect(component.searchQuery).toBe('');
    expect(component.isSearchOpen).toBeFalse();
    expect(component.filteredSearchResults.length).toBe(0);
  });
});



