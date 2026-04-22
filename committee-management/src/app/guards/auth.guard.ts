import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (state.url === '/dashboard' || state.url === '/dashboard/') {
      const homeRoute = this.authService.getRoleHomeRoute();
      return this.router.createUrlTree([homeRoute === '/auth/login' ? '/' : homeRoute]);
    }

    return true;
  }
}
