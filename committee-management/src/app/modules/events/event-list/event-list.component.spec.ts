import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { EventListComponent } from './event-list.component';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    eventServiceSpy = jasmine.createSpyObj<EventService>('EventService', ['getEvents', 'registerForEvent', 'getRegistrationsForUser']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'canManageCreationActions',
      'getCurrentRole',
      'isStudentRole',
      'getMyProfile'
    ]);
    notificationServiceSpy = jasmine.createSpyObj<NotificationService>('NotificationService', ['add']);

    authServiceSpy.canManageCreationActions.and.returnValue(false);
    authServiceSpy.getCurrentRole.and.returnValue('STUDENT');
    authServiceSpy.isStudentRole.and.returnValue(true);
    authServiceSpy.getMyProfile.and.returnValue(of({ userId: 77, role: 'STUDENT' } as any));

    eventServiceSpy.getEvents.and.returnValue(of([
      { id: 1, eventName: 'Event One', eventDate: '2026-04-25T10:00:00' },
      { id: 2, eventName: 'Event Two', eventDate: '2026-04-26T11:00:00' }
    ] as any));
    eventServiceSpy.getRegistrationsForUser.and.returnValues(
      of([
        {
          id: 11,
          userId: 77,
          eventId: 2,
          eventName: 'Event Two',
          eventDate: '2026-04-26T11:00:00',
          status: 'APPROVED',
          registeredAt: '2026-04-21T10:00:00'
        }
      ] as any),
      of([
        {
          id: 11,
          userId: 77,
          eventId: 2,
          eventName: 'Event Two',
          eventDate: '2026-04-26T11:00:00',
          status: 'APPROVED',
          registeredAt: '2026-04-21T10:00:00'
        },
        {
          id: 12,
          userId: 77,
          eventId: 1,
          eventName: 'Event One',
          eventDate: '2026-04-25T10:00:00',
          status: 'PENDING',
          registeredAt: '2026-04-22T08:00:00'
        }
      ] as any)
    );
    eventServiceSpy.registerForEvent.and.returnValue(of({ success: true, message: 'Participant registered successfully' } as any));

    await TestBed.configureTestingModule({
      declarations: [EventListComponent],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load My Events for current user', () => {
    expect(component.myRegistrations.length).toBe(1);
    expect(component.myRegistrations[0].eventId).toBe(2);
    expect(component.hasRegistration(2)).toBeTrue();
    expect(component.getRegisterButtonLabel(2)).toBe('Approved');
  });

  it('should register event and mark button as Pending Approval', () => {
    component.register(1);

    expect(eventServiceSpy.registerForEvent).toHaveBeenCalledWith(1, 77);
    expect(component.hasRegistration(1)).toBeTrue();
    expect(component.getRegisterButtonLabel(1)).toBe('Pending Approval');
    expect(component.myRegistrations.some((item) => item.eventId === 1)).toBeTrue();
    expect(component.infoMessageType).toBe('success');
  });

  it('should not attempt duplicate registration when already registered', () => {
    component.register(2);

    expect(eventServiceSpy.registerForEvent).not.toHaveBeenCalledWith(2, 77);
    expect(component.infoMessage).toContain('already approved');
  });

  it('should show duplicate error message for 409 response', () => {
    eventServiceSpy.registerForEvent.and.returnValue(throwError(() => ({
      status: 409,
      error: { message: 'Registration already exists' }
    })));

    component.register(1);

    expect(component.infoMessageType).toBe('error');
    expect(component.infoMessage).toContain('already registered');
  });
});
