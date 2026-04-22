import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { getTaskPriorityBadgeClass, getTaskStatusBadgeClass } from '../../../shared/utils/badge.utils';

@Component({
  selector: 'app-task-detail',
  standalone: false,
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.css'
})
export class TaskDetailComponent {
  task?: Task;
  loading = true;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private taskService: TaskService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.loading = true;
      this.errorMessage = '';
      this.task = undefined;

      const id = Number(params.get('id'));
      if (!Number.isFinite(id) || id <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid task identifier.';
        return;
      }

      this.taskService.getTaskById(id).subscribe({
        next: (task) => {
          this.loading = false;
          this.task = task || undefined;
          if (!this.task) {
            this.errorMessage = 'Task not found.';
          }
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Unable to load task details right now.';
        }
      });
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    return getTaskStatusBadgeClass(status);
  }

  getPriorityBadgeClass(priority: string | undefined): string {
    return getTaskPriorityBadgeClass(priority);
  }

  formatDateTime(value: string | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
