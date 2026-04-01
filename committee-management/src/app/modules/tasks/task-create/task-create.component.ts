import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-create',
  standalone: false,
  templateUrl: './task-create.component.html',
  styleUrl: './task-create.component.css'
})
export class TaskCreateComponent {
  private fb = inject(FormBuilder);

  submitting = false;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['PENDING'],
    priority: ['MEDIUM'],
    startDate: [''],
    endDate: ['']
  });

  constructor(private taskService: TaskService, private router: Router) {}

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.taskService.createTask(this.taskForm.getRawValue() as Task).subscribe(() => {
      this.submitting = false;
      this.router.navigate(['/tasks']);
    });
  }
}
