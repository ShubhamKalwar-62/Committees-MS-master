import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../services/auth.service';
import { StudentOnboardingService } from '../../../services/student-onboarding.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let studentOnboardingServiceSpy: jasmine.SpyObj<StudentOnboardingService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentRole']);
    studentOnboardingServiceSpy = jasmine.createSpyObj<StudentOnboardingService>('StudentOnboardingService', ['refreshStatus'], {
      isNewUser$: of(true)
    });

    authServiceSpy.getCurrentRole.and.returnValue('STUDENT');

    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: StudentOnboardingService, useValue: studentOnboardingServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should lock student task and attendance links for new users', () => {
    component.isNewUser = true;

    expect(component.isMenuItemLocked({ label: 'My Tasks', icon: 'assignment', route: '/tasks' })).toBeTrue();
    expect(component.isMenuItemLocked({ label: 'Attendance', icon: 'fact_check', route: '/attendance' })).toBeTrue();
    expect(component.isMenuItemLocked({ label: 'Events', icon: 'event', route: '/events' })).toBeFalse();
  });

  it('should provide lock tooltip only for locked items', () => {
    component.isNewUser = true;

    expect(component.getMenuItemLockTooltip({ label: 'My Tasks', icon: 'assignment', route: '/tasks' })).toBe('Complete onboarding to unlock');
    expect(component.getMenuItemLockTooltip({ label: 'Events', icon: 'event', route: '/events' })).toBeNull();
  });

  it('should unlock links after onboarding completion', () => {
    component.isNewUser = false;

    expect(component.isMenuItemLocked({ label: 'My Tasks', icon: 'assignment', route: '/tasks' })).toBeFalse();
    expect(component.getMenuItemLockTooltip({ label: 'My Tasks', icon: 'assignment', route: '/tasks' })).toBeNull();
  });
});



