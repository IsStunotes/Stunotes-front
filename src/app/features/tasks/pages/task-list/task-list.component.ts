import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../../services/task.service';
import { CategoryService } from '../../../../services/category.service';
import { TaskResponse } from '../../../../models/task.model';
import { CategoryResponse } from '../../../../models/category.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ChatComponent } from '../../../chat/chat.component';
import Swal from 'sweetalert2';
import { SidebarComponent } from "../../../../shared/components/sidebar/sidebar.component";
@Component({
  selector: 'app-task-list',
  template: `
    <app-navbar></app-navbar>
    <app-sidebar></app-sidebar> 
    <div class="task-container">     
    <div class="task-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <i class="fas fa-arrow-left"></i> Atrás
          </button>
          <button class="new-task-btn" (click)="createNewTask()">
            <i class="fas fa-plus"></i> Nueva Tarea
          </button>
        </div>
        
        <div class="search-filters">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Buscar por nombre de categoría..."
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              (input)="onSearchInput()">
          </div>
          
          <!-- Filtro de ordenamiento -->
          <div class="sort-container">
            <select 
              class="sort-select" 
              [(ngModel)]="sortBy" 
              (change)="onSortChange()">
              <option value="">Sin ordenar</option>
              <option value="priority">Ordenar por prioridad</option>
              <option value="createdAt">Ordenar por fecha</option>
              <option value="title">Ordenar por título</option>
            </select>
            
            <select 
              *ngIf="sortBy" 
              class="sort-direction-select" 
              [(ngModel)]="sortDirection" 
              (change)="onSortChange()">
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando tareas...</p>
      </div>

      <div *ngIf="!loading" class="tasks-content">
        
        <!-- Mostrar filtros activos -->
        <div *ngIf="hasActiveFilters()" class="active-filters">
          <span class="filter-label">Filtros activos:</span>
          <span *ngIf="searchTerm" class="filter-tag">
            Búsqueda: "{{ searchTerm }}"
            <button (click)="clearSearch()" class="remove-filter">×</button>
          </span>
          <span *ngIf="selectedCategoryName" class="filter-tag">
            Categoría: "{{ selectedCategoryName }}"
            <button (click)="clearCategoryFilter()" class="remove-filter">×</button>
          </span>
          <span *ngIf="sortBy" class="filter-tag">
            Orden: {{ getSortText() }}
            <button (click)="clearSort()" class="remove-filter">×</button>
          </span>
          <button (click)="clearAllFilters()" class="clear-all-filters">Limpiar todo</button>
        </div>
        
        <div class="tasks-section">
          <h2 class="section-title">
            TAREAS ACTIVAS 
            <span class="task-count">({{ activeTasks.length }})</span>
          </h2>
          
          <div *ngIf="activeTasks.length === 0 && !hasActiveFilters()" class="no-tasks">
            <i class="fas fa-tasks"></i>
            <p>No hay tareas activas</p>
            <button class="create-task-btn" (click)="createNewTask()">
              <i class="fas fa-plus"></i> Crear primera tarea
            </button>
          </div>

          <div *ngIf="activeTasks.length === 0 && hasActiveFilters()" class="no-tasks">
            <i class="fas fa-search"></i>
            <p>No se encontraron tareas con los filtros aplicados</p>
            <button class="clear-filters-btn" (click)="clearAllFilters()">
              <i class="fas fa-times"></i> Limpiar filtros
            </button>
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
              <p class="task-description">{{ task.description || 'Sin descripción' }}</p>
              
              <div class="task-meta">
                <span class="task-category" *ngIf="task.category">
                  <i class="fas fa-folder"></i>
                  {{ task.category.name }}
                </span>
                <span class="task-priority" [ngClass]="getPriorityColor(task.priority)">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ getPriorityText(task.priority) }}
                </span>
                <span class="task-date">
                  <i class="fas fa-calendar"></i>
                  Creada: {{ task.createdAt | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="tasks-section">
          <h2 class="section-title">
            TAREAS COMPLETADAS 
            <span class="task-count">({{ completedTasks.length }})</span>
          </h2>
          
          <div *ngIf="completedTasks.length === 0 && !hasActiveFilters()" class="no-tasks">
            <i class="fas fa-check-circle"></i>
            <p>No hay tareas completadas</p>
          </div>

          <div *ngIf="completedTasks.length === 0 && hasActiveFilters()" class="no-tasks">
            <i class="fas fa-search"></i>
            <p>No se encontraron tareas completadas con los filtros aplicados</p>
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
              <p class="task-description">{{ task.description || 'Sin descripción' }}</p>
              
              <div class="task-meta">
                <span class="task-category" *ngIf="task.category">
                  <i class="fas fa-folder"></i>
                  {{ task.category.name }}
                </span>
                <span class="task-priority" [ngClass]="getPriorityColor(task.priority)">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ getPriorityText(task.priority) }}
                </span>
                <span class="task-date">
                  <i class="fas fa-calendar-check"></i>
                  Completada: {{ task.finishedAt | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div *ngIf="totalPages > 1" class="pagination-container">
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === 0" 
            (click)="goToPage(currentPage - 1)">
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <span class="pagination-info">
            Página {{ currentPage + 1 }} de {{ totalPages }}
          </span>
          
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === totalPages - 1" 
            (click)="goToPage(currentPage + 1)">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
    <app-floating-chat></app-floating-chat>
    <app-footer></app-footer>
 `,
  styleUrls: ['./task-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarLoggedComponent, FooterComponent, ChatComponent, SidebarComponent]
})
export class TaskListComponent implements OnInit {
  activeTasks: TaskResponse[] = [];
  completedTasks: TaskResponse[] = [];
  categories: CategoryResponse[] = [];
  loading = false;
  searchTerm = '';
  selectedCategoryName = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    public router: Router
  ) {}

  goBack(): void {
    history.back();
  }

  ngOnInit(): void {
    this.loadCategories(() => {
      this.loadTasks();
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

  loadTasks(): void {
    this.loading = true;
    
    // Determinar qué parámetro de búsqueda usar
    let categoryName = '';
    
    if (this.searchTerm && this.searchTerm.trim()) {
      categoryName = this.searchTerm.trim();
    } else if (this.selectedCategoryName) {
      categoryName = this.selectedCategoryName;
    }
    
    if (categoryName) {
      this.taskService.searchTasksByCategoryName(
        categoryName, 
        this.currentPage, 
        this.pageSize,
        this.sortBy || undefined,
        this.sortDirection
      ).subscribe({
        next: (response) => {
          this.processTasksResponse(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.showError('Error al cargar las tareas');
          this.loading = false;
        }
      });
    } else {
      this.taskService.getTasks(
        this.currentPage, 
        this.pageSize,
        undefined,
        undefined,
        this.sortBy || undefined,
        this.sortDirection
      ).subscribe({
        next: (response) => {
          this.processTasksResponse(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.showError('Error al cargar las tareas');
          this.loading = false;
        }
      });
    }
  }

  private processTasksResponse(response: any): void {
    this.activeTasks = response.content.filter((task: TaskResponse) => !task.finishedAt);
    this.completedTasks = response.content.filter((task: TaskResponse) => task.finishedAt);
    
    this.totalPages = response.totalPages;
    this.totalElements = response.totalElements;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCategoryName = ''; 
    this.loadTasks();
  }

  onSearchInput(): void {
    // this.onSearch();
  }

  onCategoryFilterChange(): void {
    this.currentPage = 0;
    this.searchTerm = ''; 
    this.loadTasks();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadTasks();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadTasks();
  }

  clearCategoryFilter(): void {
    this.selectedCategoryName = '';
    this.currentPage = 0;
    this.loadTasks();
  }

  clearSort(): void {
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadTasks();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryName = '';
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadTasks();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategoryName || this.sortBy);
  }

  getSortText(): string {
    if (!this.sortBy) return '';
    
    const sortTexts: { [key: string]: string } = {
      'priority': 'Prioridad',
      'createdAt': 'Fecha de creación',
      'title': 'Título'
    };
    
    const direction = this.sortDirection === 'asc' ? 'Ascendente' : 'Descendente';
    return `${sortTexts[this.sortBy]} (${direction})`;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']); 
  }

  navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']); 
  }

  deleteTask(taskId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La tarea ha sido eliminada correctamente.', 'success');
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error deleting task:', error);
            this.showError('Error al eliminar la tarea');
          }
        });
      }
    });
  }

  markAsCompleted(taskId: number): void {
    Swal.fire({
      title: '¿Marcar como completada?',
      text: 'La tarea se moverá a la sección de completadas',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.markAsCompleted(taskId).subscribe({
          next: () => {
            Swal.fire('Completada', 'La tarea ha sido marcada como completada.', 'success');
            this.loadTasks();
          },
          error: (error) => {
            console.error('Error marking task as completed:', error);
            this.showError('Error al marcar la tarea como completada');
          }
        });
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

  private showError(message: string): void {
    Swal.fire('Error', message, 'error');
  }
  
}