import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../../core/services/task.service';
import { TaskRequest, TaskResponse } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="form-container">
  <div class="form-header">
    <h1 class="form-title">
      <i class="fas fa-tasks"></i>
      {{ isEditMode ? 'Editar Tarea' : 'Nueva Tarea' }}
    </h1>
    <button class="back-btn" (click)="onCancel()" type="button">
      <i class="fas fa-arrow-left"></i>
      Volver
    </button>
  </div>

  <div [@If]="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Cargando tarea...</p>
  </div>

  <div [@If]="!loading" class="form-content">
    <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
      
      <div class="form-group">
        <label for="title" class="form-label">
          <i class="fas fa-heading"></i>
          Título *
        </label>
        <input
          type="text"
          id="title"
          formControlName="title"
          class="form-input"
          [class.error]="isFieldInvalid('title')"
          placeholder="Ingresa el título de la tarea">
        <div *ngIf="isFieldInvalid('title')" class="error-message">
          {{ getFieldError('title') }}
        </div>
      </div>

      <div class="form-group">
        <label for="description" class="form-label">
          <i class="fas fa-align-left"></i>
          Descripción
        </label>
        <textarea
          id="description"
          formControlName="description"
          class="form-textarea"
          [class.error]="isFieldInvalid('description')"
          placeholder="Describe los detalles de la tarea..."
          rows="4">
        </textarea>
        <div *ngIf="isFieldInvalid('description')" class="error-message">
          {{ getFieldError('description') }}
        </div>
      </div>

      <div class="form-group">
        <label for="categoryId" class="form-label">
          <i class="fas fa-folder"></i>
          Categoría *
        </label>
        <select
          id="categoryId"
          formControlName="categoryId"
          class="form-select"
          [class.error]="isFieldInvalid('categoryId')">
          <option value="">Selecciona una categoría</option>
          <option *ngFor="let category of categories" [value]="category.id">
            {{ category.name }}
          </option>
        </select>
        <div *ngIf="isFieldInvalid('categoryId')" class="error-message">
          {{ getFieldError('categoryId') }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          <i class="fas fa-exclamation-triangle"></i>
          Prioridad *
        </label>
        <div class="priority-options">
          <div *ngFor="let priority of priorities" class="priority-option">
            <input
              type="radio"
              [id]="'priority-' + priority.value"
              [value]="priority.value"
              formControlName="priority"
              class="priority-radio">
            <label
              [for]="'priority-' + priority.value"
              class="priority-label"
              [ngClass]="getPriorityClass(priority.value)">
              <span class="priority-indicator"></span>
              {{ priority.label }}
            </label>
          </div>
        </div>
        <div *ngIf="isFieldInvalid('priority')" class="error-message">
          {{ getFieldError('priority') }}
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          class="btn btn-cancel"
          (click)="onCancel()"
          [disabled]="submitting">
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="taskForm.invalid || submitting">
          <div *ngIf="submitting" class="btn-spinner"></div>
          <i *ngIf="!submitting" class="fas fa-save"></i>
          {{ submitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Tarea') }}
        </button>
      </div>

    </form>
  </div>
</div>
  `,
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId: number | null = null;
  loading = false;
  submitting = false;

  priorities = [
    { value: 1, label: 'Alta', color: 'high' },
    { value: 2, label: 'Media', color: 'medium' },
    { value: 3, label: 'Baja', color: 'low' }
  ];

  // Mock categories
  categories = [
    { id: 1, name: 'Trabajo' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Estudio' },
    { id: 4, name: 'Salud' },
    { id: 5, name: 'Hogar' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.taskId;

    if (this.isEditMode && this.taskId) {
      this.loadTask(this.taskId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      priority: [2, Validators.required],
      categoryId: ['', Validators.required],
      userId: [1] //  usuario autenticado
    });
  }

  loadTask(taskId: number): void {
    this.loading = true;
    this.taskService.getTaskById(taskId).subscribe({
      next: (task: TaskResponse) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          categoryId: task.category?.id,
          userId: task.user?.id
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.loading = false;
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid && !this.submitting) {
      this.submitting = true;
      const formValue = this.taskForm.value;

      const taskRequest: TaskRequest = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        categoryId: formValue.categoryId,
        userId: formValue.userId
      };

      const operation = this.isEditMode && this.taskId
        ? this.taskService.updateTask(this.taskId, taskRequest)
        : this.taskService.createTask(taskRequest);

      operation.subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error saving task:', error);
          this.submitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'El título',
      description: 'La descripción',
      priority: 'La prioridad',
      categoryId: 'La categoría'
    };
    return labels[fieldName] || fieldName;
  }

  getPriorityClass(priority: number): string {
    switch (priority) {
      case 1: return 'priority-high';
      case 2: return 'priority-medium';
      case 3: return 'priority-low';
      default: return 'priority-medium';
    }
  }
}
