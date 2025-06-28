import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NoteResponse } from '../../../../models/note.model';
import { NoteService } from '../../../../services/note.service';
import { CollectionResponse } from '../../../../models/collection.model';
import { CollectionService } from '../../../../services/collection.service';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ChatComponent } from '../../../chat/chat.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-note-list',
  template:  `
  <div class="task-container">
      <app-navbar></app-navbar>
      <div class="task-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()">
            <i class="fas fa-arrow-left"></i> Atrás
          </button>
          <button class="new-task-btn" (click)="createNewNote()">
            <i class="fas fa-plus"></i> Nueva Nota
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
        <p>Cargando notas...</p>
      </div>

      <div *ngIf="!loading" class="tasks-content">
        
        <!-- Mostrar filtros activos -->
        <div *ngIf="hasActiveFilters()" class="active-filters">
          <span class="filter-label">Filtros activos:</span>
          <span *ngIf="searchTerm" class="filter-tag">
            Búsqueda: "{{ searchTerm }}"
            <button (click)="clearSearch()" class="remove-filter">×</button>
          </span>
          <span *ngIf="selectedCollectionName" class="filter-tag">
            Categoría: "{{ selectedCollectionName }}"
            <button (click)="clearCollectionFilter()" class="remove-filter">×</button>
          </span>
          <span *ngIf="sortBy" class="filter-tag">
            Orden: {{ getSortText() }}
            <button (click)="clearSort()" class="remove-filter">×</button>
          </span>
          <button (click)="clearAllFilters()" class="clear-all-filters">Limpiar todo</button>
        </div>
        
        <div class="tasks-section">
          <h2 class="section-title">
            MIS NOTAS 
          </h2>
          
          <div *ngIf="notes.length === 0 && !hasActiveFilters()" class="no-tasks">
            <i class="fas fa-tasks"></i>
            <p>No hay notas</p>
            <button class="create-task-btn" (click)="createNewNote()">
              <i class="fas fa-plus"></i> Crear primera nota
            </button>
          </div>

          <div *ngIf="notes.length === 0 && hasActiveFilters()" class="no-tasks">
            <i class="fas fa-search"></i>
            <p>No se encontraron notas con los filtros aplicados</p>
            <button class="clear-filters-btn" (click)="clearAllFilters()">
              <i class="fas fa-times"></i> Limpiar filtros
            </button>
          </div>
          
          <div *ngFor="let note of notes" class="task-card active-task">
            <div class="task-content">
              <div class="task-actions">
                <button class="edit-btn" (click)="editNote(note.id)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" (click)="deleteNote(note.id)" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              
              <h3 class="task-title">{{ note.title }}</h3>
              <p class="task-description">{{ note.content || 'Sin contenido' }}</p>
              
              <div class="task-meta">
                <span class="task-category" *ngIf="note.collection">
                  <i class="fas fa-folder"></i>
                  {{ note.collection.name }}
                </span>
                <span class="task-date">
                  <i class="fas fa-calendar"></i>
                  Creada: {{ note.createdAt | date:'dd/MM/yyyy' }}
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
  styleUrls: ['./note-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarLoggedComponent, FooterComponent, ChatComponent]
})
export class NoteListComponent implements OnInit {
  notes: NoteResponse[] = [];
  collections: CollectionResponse[] = [];
  loading = false;
  searchTerm = '';
  selectedCollectionName = '';
  sortBy = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 0;
  pageSize = 15;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private noteService: NoteService,
    private collectionService: CollectionService,
    public router: Router
  ) {}

   goBack(): void {
    history.back();
  }

  ngOnInit(): void {
    this.loadCollections(() => {
      this.loadNotes();
    });
  }

  loadCollections(callback?: () => void): void {
    this.collectionService.getCollections().subscribe({
      next: (collections: CollectionResponse[]) => {
        this.collections = collections;
        if (callback) callback();
      },
      error: (error) => {
        console.error('Error al cargar colecciones:', error);
        this.showError('Error al cargar las colecciones');
      }
    });
  }

  loadNotes(): void {
    this.loading = true;

    let collectionName = '';
    if (this.searchTerm && this.searchTerm.trim()) {
      collectionName = this.searchTerm.trim();
    } else if (this.selectedCollectionName) {
      collectionName = this.selectedCollectionName;
    }

    if (collectionName) {
      this.noteService.searchNotesByCollectionName(
        collectionName,
        this.currentPage,
        this.pageSize,
        this.sortBy || undefined,
        this.sortDirection
      ).subscribe({
        next: (response) => {
          this.processNotesResponse(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar notas:', error);
          this.showError('Error al cargar las notas');
          this.loading = false;
        }
      });
    } else {
      this.noteService.getNotes(
        this.currentPage,
        this.pageSize,
        undefined,
        undefined,
        this.sortBy || undefined,
        this.sortDirection
      ).subscribe({
        next: (response) => {
          this.processNotesResponse(response);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar notas:', error);
          this.showError('Error al cargar las notas');
          this.loading = false;
        }
      });
    }
  }

  private processNotesResponse(response: any): void {
    this.notes = response.content;
    this.totalPages = response.totalPages;
    this.totalElements = response.totalElements;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCollectionName = '';
    this.loadNotes();
  }

  onSearchInput(): void {}

  onCollectionFilterChange(): void {
    this.currentPage = 0;
    this.searchTerm = '';
    this.loadNotes();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadNotes();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadNotes();
  }

  clearCollectionFilter(): void {
    this.selectedCollectionName = '';
    this.currentPage = 0;
    this.loadNotes();
  }

  clearSort(): void {
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadNotes();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCollectionName = '';
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadNotes();
  }

  hasActiveFilters(): boolean {
      return !!(this.searchTerm || this.selectedCollectionName || this.sortBy);
  }

  getSortText(): string {
    if (!this.sortBy) return '';

    const sortTexts: { [key: string]: string } = {
      'createdAt': 'Fecha de creación',
      'title': 'Título',
      'name': 'Autor'
    };

    const direction = this.sortDirection === 'asc' ? 'Ascendente' : 'Descendente';
    return `${sortTexts[this.sortBy]} (${direction})`;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadNotes();
    }
  }

  createNewNote(): void {
    this.router.navigate(['/notes/new']);
  }

  editNote(noteId: number): void {
    this.router.navigate(['/notes', noteId, 'edit']);
  }

  deleteNote(noteId: number): void {
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
        this.noteService.deleteNote(noteId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La nota ha sido eliminada correctamente.', 'success');
            this.loadNotes();
          },
          error: (error) => {
            console.error('Error al eliminar la nota:', error);
            this.showError('Error al eliminar la nota');
          }
        });
      }
    });
  }

  private showError(message: string): void {
    Swal.fire('Error', message, 'error');
  }
}
