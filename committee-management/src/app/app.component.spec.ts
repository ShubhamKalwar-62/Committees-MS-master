import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {
  const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
  const routerStub = { url: '/' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should expose the app name', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.appName).toEqual('CommitteeOS');
  });

  it('should show role workspace only on non-auth routes when authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    routerStub.url = '/dashboard';

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.showRoleWorkspace).toBeTrue();

    routerStub.url = '/auth/login';
    expect(app.showRoleWorkspace).toBeFalse();
  });
});
