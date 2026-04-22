import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Committee } from '../../../models/committee.model';
import { Task } from '../../../models/task.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';
import { CommitteeService } from '../../../services/committee.service';
import { NotificationService } from '../../../services/notification.service';
import { TaskService } from '../../../services/task.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-task-create',
  standalone: false,
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css'
})
export class TaskCreateComponent {
  private fb = inject(FormBuilder);

  submitting = false;
  errorMessage = '';
  committees: Committee[] = [];
  users: User[] = [];
  assignableUsers: User[] = [];
  creatorLabel = 'Current User';

  private currentUserId: number | null = null;

  readonly statusOptions: Array<{ label: string; value: string }> = [
    { label: 'pending', value: 'PENDING' },
    { label: 'in-progress', value: 'IN_PROGRESS' },
    { label: 'completed', value: 'COMPLETED' }
  ];

  readonly priorityOptions: Array<{ label: string; value: string }> = [
    { label: 'low', value: 'LOW' },
    { label: 'medium', value: 'MEDIUM' },
    { label: 'high', value: 'HIGH' },
    { label: 'urgent', value: 'URGENT' }
  ];

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['PENDING', Validators.required],
    priority: ['MEDIUM', Validators.required],
    startDate: [''],
    endDate: [''],
    committeeId: [null as number | null, Validators.required],
    createdById: [null as number | null, Validators.required],
    assignedToId: [null as number | null]
  });

  constructor(
    private taskService: TaskService,
    private committeeService: CommitteeService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.currentUserId = profile.userId ?? null;
        if (this.currentUserId) {
          this.taskForm.patchValue({ createdById: this.currentUserId });
        }

        this.creatorLabel = (profile.name || profile.email || 'Current User').trim();
      },
      error: () => {
        this.currentUserId = null;
      }
    });

    this.committeeService.getCommittees().subscribe((committees) => {
      this.committees = committees;
      if (!this.taskForm.value.committeeId && committees.length > 0) {
        this.taskForm.patchValue({ committeeId: committees[0].id || null });
      }
    });

    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.assignableUsers = users.filter((user) => this.isAssignableRole(user.role));

      if (!this.taskForm.value.createdById && users.length > 0) {
        const fallbackCreatorId = users[0].id || null;
        this.taskForm.patchValue({ createdById: fallbackCreatorId });
        if (!this.currentUserId) {
          this.creatorLabel = users[0].name || 'Current User';
        }

        return;
      }

      if (this.currentUserId) {
        const matchedCreator = users.find((user) => user.id === this.currentUserId);
        if (matchedCreator?.name) {
          this.creatorLabel = matchedCreator.name;
        }
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const startDate = this.taskForm.value.startDate;
    const endDate = this.taskForm.value.endDate;
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      if (!Number.isNaN(parsedStartDate.getTime()) && !Number.isNaN(parsedEndDate.getTime()) && parsedEndDate < parsedStartDate) {
        this.errorMessage = 'Deadline must be after the start date.';
        return;
      }
    }

    this.submitting = true;
    this.errorMessage = '';
    this.taskService.createTask(this.taskForm.getRawValue() as Task).subscribe({
      next: () => {
        this.submitting = false;
        this.notificationService.add({
          title: 'Task Created',
          message: 'Task created successfully.',
          level: 'success',
          actionRoute: '/tasks'
        });
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        this.submitting = false;
        const message = err?.error?.message || 'Unable to create task. Check Committee/User IDs and data values.';
        this.errorMessage = message;
        this.notificationService.add({
          title: 'Task Creation Failed',
          message,
          level: 'error',
          actionRoute: '/tasks/create'
        });
      }
    });
  }

  getAssigneeRoleLabel(user: User): string {
    const role = this.normalizeRole(user.role);
    return role ? role.toLowerCase() : 'member';
  }

  private isAssignableRole(role: string | undefined): boolean {
    const normalizedRole = this.normalizeRole(role);
    return normalizedRole === 'FACULTY' || normalizedRole === 'STUDENT';
  }

  private normalizeRole(role: string | undefined): string {
    const normalized = (role || '').trim().toUpperCase();
    if (!normalized) {
      return '';
    }

    return normalized.startsWith('ROLE_') ? normalized.substring(5) : normalized;
  }
}
