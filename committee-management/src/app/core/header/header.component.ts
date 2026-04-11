import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() appName = 'Committee Management';

  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentRole(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  get homeRoute(): string {
    return this.isLoggedIn ? this.authService.getRoleHomeRoute() : '/';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

}
