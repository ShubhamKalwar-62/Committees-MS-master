import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  appName = 'CommitteeOS';
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService, private router: Router) {}

  get useImmersiveStudentProfileLayout(): boolean {
    return false;
  }

  get showRoleWorkspace(): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    const path = this.router.url.split('?')[0].split('#')[0];
    return path !== '/' && path !== '/landing' && !path.startsWith('/auth');
  }

  get isLandingRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/' || path === '/landing';
  }
}
