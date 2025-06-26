import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../../services/task.service';
import { TaskResponse } from '../../../../models/task.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ChatComponent } from '../../../chat/chat.component';
@Component({
  selector: 'app-task-list',
  template: `
    <div class="task-container">
      <app-navbar></app-navbar>
      <div class="task-header">
        <div class="header-left">
          <button class="back-btn" (click)="router.navigate(['/'])">
            <i class="fas fa-arrow-left"></i> Atrás
          </button>
          <button class="new-task-btn" (click)="createNewTask()">
            <i class="fas fa-plus"></i> Nueva Tarea
          </button>
          <button class="new-task-btn" (click)="goToRepo()">Repositorios</button>
        </div>
        
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar tareas..."
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearchTasks()">
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>

      <div *ngIf="!loading" class="tasks-content">
        
        <div class="tasks-section">
          <h2 class="section-title">TAREAS ACTIVAS</h2>
          
          <div *ngIf="activeTasks.length === 0" class="no-tasks">
            <p>No hay tareas activas</p>
          </div>
          
          <div *ngFor="let task of activeTasks" class="task-card active-task">
            <div class="task-content">
              <div class="task-actions">
                <button class="edit-btn" (click)="editTask(task.id)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" (click)="deleteTask(task.id)" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
                <button class="complete-btn" (click)="markAsCompleted(task.id)" title="Marcar como completada">
                  <i class="fas fa-check"></i>
                </button>
              </div>
              
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.description }}</p>
              
              <div class="task-meta">
                <span class="task-category" *ngIf="task.category">
                  {{ task.category.name }}
                </span>
                <span class="task-priority" [ngClass]="getPriorityColor(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </span>
                <span class="task-date">
                  Creada: {{ task.createdAt | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="tasks-section">
          <h2 class="section-title">TAREAS COMPLETADAS</h2>
          
          <div *ngIf="completedTasks.length === 0" class="no-tasks">
            <p>No hay tareas completadas</p>
          </div>
          
          <div *ngFor="let task of completedTasks" class="task-card completed-task">
            <div class="task-content">
              <div class="task-actions">
                <button class="view-btn" (click)="editTask(task.id)" title="Ver detalles">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="delete-btn" (click)="deleteTask(task.id)" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              
              <div class="completed-indicator">
                <i class="fas fa-check-circle"></i>
              </div>
              
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.description }}</p>
              
              <div class="task-meta">
                <span class="task-category" *ngIf="task.category">
                  {{ task.category.name }}
                </span>
                <span class="task-priority" [ngClass]="getPriorityColor(task.priority)">
                  {{ getPriorityText(task.priority) }}
                </span>
                <span class="task-date">
                  Completada: {{ task.finishedAt | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-floating-chat></app-floating-chat>
  <app-footer></app-footer>
 `,
  styleUrls: ['./task-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NavbarLoggedComponent, FooterComponent,ChatComponent]
})
export class TaskListComponent implements OnInit {
  activeTasks: TaskResponse[] = [];
  completedTasks: TaskResponse[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  currentPage = 0;
  pageSize = 15;

  constructor(
    private taskService: TaskService,
    public router: Router // público para el template
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    
    this.taskService.getTasks(this.currentPage, this.pageSize, this.selectedCategory).subscribe({
      next: (response) => {
        this.activeTasks = response.content.filter((task: TaskResponse) => !task.finishedAt);
        this.completedTasks = response.content.filter((task: TaskResponse) => task.finishedAt);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  onSearchTasks(): void {
    this.loadTasks();
  }

  filterByCategory(categoryName: string): void {
    this.selectedCategory = categoryName;
    this.loadTasks();
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']); 
  }

  editTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']); 
  }

  deleteTask(taskId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  markAsCompleted(taskId: number): void {
    this.taskService.markAsCompleted(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error marking task as completed:', error);
      }
    });
  }

  getPriorityColor(priority: number): string {
    switch (priority) {
      case 1: return 'priority-high';
      case 2: return 'priority-medium';
      case 3: return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getPriorityText(priority: number): string {
    switch (priority) {
      case 1: return 'Alta';
      case 2: return 'Media';
      case 3: return 'Baja';
      default: return 'Media';
    }
  }
   goToRepo(): void {
  this.router.navigate(['/repositorios/list']);
}
}