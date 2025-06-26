import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../../services/task.service';
import { CategoryService } from '../../../../services/category.service';
import { TaskRequest, TaskResponse } from '../../../../models/task.model';
import { CategoryResponse } from '../../../../models/category.model';
import Swal from 'sweetalert2';

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

  <div *ngIf="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Cargando tarea...</p>
  </div>

  <div *ngIf="!loading" class="form-content">
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
  categories: CategoryResponse[] = [];
  isEditMode = false;
  taskId: number | null = null;
  loading = false;
  submitting = false;

  priorities = [
    { value: 1, label: 'Alta', color: 'high' },
    { value: 2, label: 'Media', color: 'medium' },
    { value: 3, label: 'Baja', color: 'low' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEditMode = !!this.taskId;
    
    this.loadCategories(() => {
      if (this.isEditMode && this.taskId) {
        this.loadTask(this.taskId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      priority: [2, Validators.required],
      categoryId: ['', Validators.required],
      userId: [1] // Valor fijo para el usuario autenticado
    });
  }

  loadCategories(callback?: () => void): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: CategoryResponse[]) => {
        this.categories = categories;
        if (callback) callback();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showError('Error al cargar las categorías');
      }
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
        this.showError('Error al cargar la tarea');
        this.loading = false;
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched();
      Swal.fire('Error', 'Por favor complete todos los campos correctamente.', 'error');
      return;
    }

    if (!this.submitting) {
      this.submitting = true;
      const formValue = this.taskForm.value;

      const taskRequest: TaskRequest = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        categoryId: formValue.categoryId,
        userId: formValue.userId
      };

      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, taskRequest).subscribe({
          next: () => {
            this.submitting = false;
            Swal.fire('Actualizado', 'La tarea fue actualizada correctamente.', 'success');
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.submitting = false;
            this.showError('Error al actualizar la tarea');
          }
        });
      } else {
        this.taskService.createTask(taskRequest).subscribe({
          next: () => {
            this.submitting = false;
            Swal.fire('Creado', 'La tarea fue creada correctamente.', 'success');
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.submitting = false;
            this.showError('Error al crear la tarea');
          }
        });
      }
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

  private showError(message: string): void {
    Swal.fire('Error', message, 'error');
  }
}