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

  canAccessUsers(): boolean {
    return this.authService.hasAnyRole(['ADMIN']);
  }

  canAccessCommittees(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'FACULTY']);
  }

  canManageTasks(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'FACULTY', 'STUDENT']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

}
