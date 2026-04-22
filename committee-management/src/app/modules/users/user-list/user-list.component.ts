import { Component } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent {
  users: User[] = [];
  loading = true;
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.loading = false;
        this.users = users || [];
      },
      error: () => {
        this.loading = false;
        this.users = [];
        this.errorMessage = 'Unable to load users right now. Please refresh and try again.';
      }
    });
  }

  getCountByRole(role: string): number {
    const expected = (role || '').toUpperCase();
    return this.users.filter((user) => (user.role || '').toUpperCase() === expected).length;
  }

  getRoleBadgeClass(role: string | undefined): string {
    const normalized = (role || '').toUpperCase();
    if (normalized === 'ADMIN') {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }
    if (normalized === 'FACULTY') {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }
    if (normalized === 'STUDENT') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  getUserInitials(name: string | undefined): string {
    const normalized = (name || '').trim();
    if (!normalized) {
      return 'U';
    }

    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }

}
