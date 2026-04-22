import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const isAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

    if (token && this.authService.isTokenExpired(token)) {
      this.authService.logout();
    }

    const activeToken = this.authService.getToken();
    const requestToHandle = !activeToken
      ? req
      : req.clone({
          setHeaders: {
            Authorization: `Bearer ${activeToken}`
          }
        });

    return next.handle(requestToHandle).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest) {
          this.authService.logout();
          if (!this.router.url.startsWith('/auth/login')) {
            void this.router.navigate(['/auth/login']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
