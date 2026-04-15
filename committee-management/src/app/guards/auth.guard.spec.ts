import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('should allow navigation for authenticated users', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    expect(guard.canActivate()).toBeTrue();
  });

  it('should redirect unauthenticated users to login', () => {
    const loginTree = {} as ReturnType<Router['createUrlTree']>;
    authServiceSpy.isAuthenticated.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(loginTree);

    expect(guard.canActivate()).toBe(loginTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
