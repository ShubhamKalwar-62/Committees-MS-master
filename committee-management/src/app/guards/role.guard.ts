import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    const requiredRoles = (route.data['roles'] as string[] | undefined)?.map((role) => role.toUpperCase()) || [];
    if (!requiredRoles.length) {
      return true;
    }

    if (this.authService.hasAnyRole(requiredRoles)) {
      return true;
    }

    return this.router.createUrlTree([this.authService.getRoleHomeRoute()]);
  }
}
