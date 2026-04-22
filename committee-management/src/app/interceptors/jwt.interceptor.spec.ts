import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let nextHandler: jasmine.SpyObj<HttpHandler>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'isTokenExpired', 'logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/student/dashboard' });
    router.navigate.and.resolveTo(true);
    interceptor = new JwtInterceptor(authService, router);
    nextHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    nextHandler.handle.and.returnValue(of({} as HttpEvent<unknown>));
  });

  it('should pass request through when token is missing', () => {
    authService.getToken.and.returnValues(null, null);
    const request = new HttpRequest('GET', '/api/test');

    interceptor.intercept(request, nextHandler).subscribe();

    expect(nextHandler.handle).toHaveBeenCalledWith(request);
    expect(authService.isTokenExpired).not.toHaveBeenCalled();
  });

  it('should attach bearer token when token exists', () => {
    authService.getToken.and.returnValues('abc123', 'abc123');
    authService.isTokenExpired.and.returnValue(false);
    const request = new HttpRequest('GET', '/api/test');

    interceptor.intercept(request, nextHandler).subscribe();

    const forwardedRequest = nextHandler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('should logout and forward original request when token is expired', () => {
    authService.getToken.and.returnValues('expired-token', null);
    authService.isTokenExpired.and.returnValue(true);
    const request = new HttpRequest('GET', '/api/test');

    interceptor.intercept(request, nextHandler).subscribe();

    expect(authService.logout).toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(request);
  });
});
