import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';

import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let interceptor: JwtInterceptor;
  let nextHandler: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    interceptor = new JwtInterceptor();
    nextHandler = jasmine.createSpyObj<HttpHandler>('HttpHandler', ['handle']);
    nextHandler.handle.and.returnValue(of({} as HttpEvent<unknown>));
  });

  it('should pass request through when token is missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const request = new HttpRequest('GET', '/api/test');

    interceptor.intercept(request, nextHandler).subscribe();

    expect(nextHandler.handle).toHaveBeenCalledWith(request);
  });

  it('should attach bearer token when token exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('abc123');
    const request = new HttpRequest('GET', '/api/test');

    interceptor.intercept(request, nextHandler).subscribe();

    const forwardedRequest = nextHandler.handle.calls.mostRecent().args[0] as HttpRequest<unknown>;
    expect(forwardedRequest.headers.get('Authorization')).toBe('Bearer abc123');
  });
});
