import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { getTaskPriorityBadgeClass, getTaskStatusBadgeClass } from '../../../shared/utils/badge.utils';
import { MyProfileResponse } from '../../../models/auth.model';
import { Task } from '../../../models/task.model';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { TaskService } from '../../../services/task.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {
  tasks: Task[] = [];
  myTasks: Task[] = [];
  committeeTasks: Task[] = [];
  isLoading = true;
  errorMessage = '';
  infoMessage = '';
  infoMessageType: 'success' | 'error' = 'success';
  activeView: 'MY' | 'COMMITTEE' = 'MY';
  currentUserId: number | null = null;
  statusFilter = 'ALL';
  priorityFilter = 'ALL';
  deadlineFrom = '';
  deadlineTo = '';

  private readonly myCommitteeIds = new Set<number>();
  private readonly completingTaskIds = new Set<number>();

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get canCreateTask(): boolean {
    return this.authService.canManageCreationActions();
  }

  get displayedTasks(): Task[] {
    const baseTasks = this.activeView === 'MY' ? this.myTasks : this.committeeTasks;
    return this.applyFilters(baseTasks);
  }

  get activeViewTitle(): string {
    return this.activeView === 'MY' ? 'My Tasks' : 'Committee Tasks';
  }

  get totalOpenTasks(): number {
    return this.tasks.filter((task) => !this.isTaskCompleted(task)).length;
  }

  get hasActiveFilters(): boolean {
    return this.statusFilter !== 'ALL' || this.priorityFilter !== 'ALL' || !!this.deadlineFrom || !!this.deadlineTo;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks || [];
        this.loadViewerContext();
      },
      error: () => {
        this.isLoading = false;
        this.tasks = [];
        this.myTasks = [];
        this.committeeTasks = [];
        this.errorMessage = 'Unable to load tasks right now. Please refresh and try again.';
      }
    });
  }

  setActiveView(view: 'MY' | 'COMMITTEE'): void {
    this.activeView = view;
  }

  onStatusFilterChange(event: Event): void {
    this.statusFilter = (event.target as HTMLSelectElement).value || 'ALL';
  }

  onPriorityFilterChange(event: Event): void {
    this.priorityFilter = (event.target as HTMLSelectElement).value || 'ALL';
  }

  onDeadlineFromChange(event: Event): void {
    this.deadlineFrom = (event.target as HTMLInputElement).value || '';
  }

  onDeadlineToChange(event: Event): void {
    this.deadlineTo = (event.target as HTMLInputElement).value || '';
  }

  clearFilters(): void {
    this.statusFilter = 'ALL';
    this.priorityFilter = 'ALL';
    this.deadlineFrom = '';
    this.deadlineTo = '';
  }

  canMarkComplete(task: Task): boolean {
    if (this.isTaskCompleted(task) || !task.id) {
      return false;
    }

    if (this.canCreateTask) {
      return true;
    }

    if (!this.currentUserId) {
      return false;
    }

    return task.assignedToId === this.currentUserId || task.createdById === this.currentUserId;
  }

  markTaskAsComplete(task: Task): void {
    if (!task.id || !this.canMarkComplete(task) || this.isCompletingTask(task.id)) {
      return;
    }

    const taskId = task.id;
    this.completingTaskIds.add(taskId);
    this.taskService.markTaskAsComplete(taskId)
      .pipe(finalize(() => this.completingTaskIds.delete(taskId)))
      .subscribe({
        next: (updatedTask) => {
          this.tasks = this.tasks.map((existingTask) =>
            existingTask.id === taskId ? { ...existingTask, ...updatedTask } : existingTask
          );
          this.syncTaskBuckets();

          const successMessage = `Task "${updatedTask.title || task.title}" marked as complete.`;
          this.setInfoMessage(successMessage, 'success');
          this.notificationService.add({
            title: 'Task Completed',
            message: successMessage,
            level: 'success',
            actionRoute: '/tasks'
          });
        },
        error: (error: HttpErrorResponse) => {
          const message = this.extractCompleteTaskErrorMessage(error);
          this.setInfoMessage(message, 'error');
          this.notificationService.add({
            title: 'Unable To Complete Task',
            message,
            level: 'error',
            actionRoute: '/tasks'
          });
        }
      });
  }

  isCompletingTask(taskId: number | undefined): boolean {
    return !!taskId && this.completingTaskIds.has(taskId);
  }

  isTaskCompleted(task: Task): boolean {
    return this.normalizeValue(task.status) === 'COMPLETED';
  }

  isOverdue(task: Task): boolean {
    if (!task.endDate || this.isTaskCompleted(task)) {
      return false;
    }

    const deadline = new Date(task.endDate);
    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    return deadline.getTime() < Date.now();
  }

  formatStatus(status: string | undefined): string {
    const normalized = this.normalizeValue(status);
    if (!normalized) {
      return 'unknown';
    }

    return normalized.toLowerCase().replace(/_/g, '-');
  }

  formatPriority(priority: string | undefined): string {
    const normalized = this.normalizeValue(priority);
    if (!normalized) {
      return 'normal';
    }

    return normalized.toLowerCase();
  }

  getAssigneeLabel(task: Task): string {
    const name = (task.assignedToName || '').trim();
    if (name) {
      return name;
    }

    if (task.assignedToId) {
      return `User #${task.assignedToId}`;
    }

    return 'Unassigned';
  }

  getCommitteeLabel(task: Task): string {
    const name = (task.committeeName || '').trim();
    if (name) {
      return name;
    }

    if (task.committeeId) {
      return `Committee #${task.committeeId}`;
    }

    return 'Unknown committee';
  }

  getTaskStatusBadgeClass(status: string | undefined): string {
    return getTaskStatusBadgeClass(status);
  }

  getPriorityBadgeClass(priority: string | undefined): string {
    return getTaskPriorityBadgeClass(priority);
  }

  formatDate(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private loadViewerContext(): void {
    this.authService.getMyProfile().subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.syncTaskBuckets();
        this.isLoading = false;
      },
      error: () => {
        this.currentUserId = null;
        this.myCommitteeIds.clear();
        this.syncTaskBuckets();
        this.isLoading = false;
      }
    });
  }

  private applyProfile(profile: MyProfileResponse): void {
    this.currentUserId = profile.userId ?? null;
    this.myCommitteeIds.clear();

    (profile.committeeMemberships || []).forEach((membership) => {
      const committeeId = membership?.committeeId;
      if (committeeId) {
        this.myCommitteeIds.add(committeeId);
      }
    });
  }

  private syncTaskBuckets(): void {
    this.myTasks = this.tasks.filter((task) => this.isMyTask(task));

    const committeeScopedTasks = this.tasks.filter((task) => this.belongsToCommitteeView(task));
    this.committeeTasks = committeeScopedTasks.filter((task) => !this.isMyTask(task));

    if (this.activeView === 'MY' && this.myTasks.length === 0 && this.committeeTasks.length > 0) {
      this.activeView = 'COMMITTEE';
    }

    if (this.activeView === 'COMMITTEE' && this.committeeTasks.length === 0 && this.myTasks.length > 0) {
      this.activeView = 'MY';
    }
  }

  private applyFilters(tasks: Task[]): Task[] {
    const normalizedStatusFilter = this.normalizeValue(this.statusFilter);
    const normalizedPriorityFilter = this.normalizeValue(this.priorityFilter);

    const fromDate = this.parseDateAtBoundary(this.deadlineFrom, false);
    const toDate = this.parseDateAtBoundary(this.deadlineTo, true);

    return tasks.filter((task) => {
      if (normalizedStatusFilter && normalizedStatusFilter !== 'ALL' && this.normalizeValue(task.status) !== normalizedStatusFilter) {
        return false;
      }

      if (normalizedPriorityFilter && normalizedPriorityFilter !== 'ALL' && this.normalizeValue(task.priority) !== normalizedPriorityFilter) {
        return false;
      }

      if (!fromDate && !toDate) {
        return true;
      }

      if (!task.endDate) {
        return false;
      }

      const taskDeadline = new Date(task.endDate);
      if (Number.isNaN(taskDeadline.getTime())) {
        return false;
      }

      if (fromDate && taskDeadline < fromDate) {
        return false;
      }

      if (toDate && taskDeadline > toDate) {
        return false;
      }

      return true;
    });
  }

  private parseDateAtBoundary(rawValue: string, endOfDay: boolean): Date | null {
    if (!rawValue) {
      return null;
    }

    const parsed = new Date(rawValue);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }

    return parsed;
  }

  private isMyTask(task: Task): boolean {
    return this.currentUserId !== null && task.assignedToId === this.currentUserId;
  }

  private belongsToCommitteeView(task: Task): boolean {
    if (this.myCommitteeIds.size > 0) {
      return task.committeeId !== undefined && task.committeeId !== null && this.myCommitteeIds.has(task.committeeId);
    }

    return this.canCreateTask;
  }

  private setInfoMessage(message: string, type: 'success' | 'error'): void {
    this.infoMessage = message;
    this.infoMessageType = type;
  }

  private normalizeValue(value: string | undefined): string {
    const normalized = (value || '').trim().toUpperCase().replace(/-/g, '_');
    if (!normalized) {
      return '';
    }

    return normalized.startsWith('ROLE_') ? normalized.substring(5) : normalized;
  }

  private extractCompleteTaskErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again and retry.';
    }

    if (error.status === 403) {
      return 'You are not allowed to complete this task.';
    }

    if (error.status === 404) {
      return 'This task no longer exists.';
    }

    return (
      (error?.error && typeof error.error === 'object' && (error.error.message || error.error.error)) ||
      (typeof error?.error === 'string' ? error.error : '') ||
      error?.message ||
      'Unable to complete this task right now.'
    );
  }

}
