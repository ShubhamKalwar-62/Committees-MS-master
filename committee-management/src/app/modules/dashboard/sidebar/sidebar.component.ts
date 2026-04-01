import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  get role(): string {
    return this.authService.getCurrentRole() || 'GUEST';
  }

  canAccessUsers(): boolean {
    return this.authService.hasAnyRole(['ADMIN']);
  }

  canAccessCommittees(): boolean {
    return this.authService.hasAnyRole(['ADMIN', 'FACULTY']);
  }

}
