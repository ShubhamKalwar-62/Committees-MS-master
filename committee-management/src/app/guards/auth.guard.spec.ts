import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'getRoleHomeRoute']);
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

    expect(guard.canActivate({} as ActivatedRouteSnapshot, { url: '/users' } as RouterStateSnapshot)).toBeTrue();
  });

  it('should redirect unauthenticated users to login', () => {
    const loginTree = {} as ReturnType<Router['createUrlTree']>;
    authServiceSpy.isAuthenticated.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(loginTree);

    expect(guard.canActivate({} as ActivatedRouteSnapshot, { url: '/users' } as RouterStateSnapshot)).toBe(loginTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect authenticated /dashboard access to role home route', () => {
    const roleHomeTree = {} as ReturnType<Router['createUrlTree']>;
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getRoleHomeRoute.and.returnValue('/faculty/dashboard');
    routerSpy.createUrlTree.and.returnValue(roleHomeTree);

    expect(guard.canActivate({} as ActivatedRouteSnapshot, { url: '/dashboard' } as RouterStateSnapshot)).toBe(roleHomeTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/faculty/dashboard']);
  });
});
