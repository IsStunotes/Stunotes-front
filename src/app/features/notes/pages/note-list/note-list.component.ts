import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NoteResponse, } from '../../../../models/note.model';
import { NoteService } from '../../../../services/note.service';
import { CollectionResponse,CollectionRequest } from '../../../../models/collection.model';
import { CollectionService } from '../../../../services/collection.service';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ChatComponent } from '../../../chat/chat.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-note-list',
  template:  `

   <app-navbar></app-navbar>
   <app-sidebar></app-sidebar>
   <div class="container">
      <div class="note-container">
         <div class="search-header">
            <div class="header-left">
               <button class="back-btn" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i> Atrás
               </button>
               <button class="new-save-btn" (click)="createNewNote()">
                  <i class="fas fa-plus"></i> Nueva Nota
               </button>
               <button class="new-save-btn" (click)="openModal()">
                  <i class="fas fa-plus"></i> Nueva colección
               </button>
            </div>
           <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()"></div>

         <div class="modal" *ngIf="showModal">
            <div class="modal-header">
               <h2>{{ (this.editCol)? 'Editar':'Nueva'}} colección</h2>
               <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
               <label for="collectionName">Nombre de la colección</label>
               <input id="collectionName" type="text" [(ngModel)]="newCollectionName" placeholder="Ingrese nombre">
            </div>
            <div class="modal-footer">
               <button class="new-save-btn" (click)="this.editCol? editCollection() : createNewCollection()">Guardar</button>
               <button class="back-btn" (click)="closeModal()">Cancelar</button>
            </div>
         </div>
            <div class="search-filters">
               <div class="search-container">
                  <input 
                  type="text" 
                  class="search-input" 
                  placeholder="Buscar por nombre de nota o colección..."
                  [(ngModel)]="searchTerm"
                  (keyup.enter)="onSearch()"
                  (input)="onSearch()">
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
            <span *ngIf="selectedCollectionId" class="filter-tag">
               Colleción: "{{ selectedCollectionId }}"
               <button (click)="clearCollectionFilter()" class="remove-filter">×</button>
            </span>
            <span *ngIf="sortBy" class="filter-tag">
               Orden: {{ getSortText() }}
               <button (click)="clearSort()" class="remove-filter">×</button>
            </span>
            <button (click)="clearAllFilters()" class="clear-all-filters">Limpiar todo</button>
         </div>
         
         <div class="col-section">
            <div class="col-title">
               <h2 class="section-title">MIS COLLECIONES</h2>
            </div>
            <div class="col-actions">
               <button class="edit-btn" (click)="openModal(true)" title="Editar">
                  <i class="fas fa-edit"></i>
               </button>
               <button class="delete-btn" (click)="deleteCollection()" title="Eliminar">
                  <i class="fas fa-trash"></i>
               </button>
            </div>
         </div>

         <div *ngIf="collections.length === 0" class="no-tasks">
            <i class="fas fa-folder-open"></i>
            <p>No hay colecciones</p>
            <button class="create-task-btn" (click)="createNewNote()">
               <i class="fas fa-plus"></i> Crear primera colección
            </button>
         </div>


         <div class="collection-container">
            <div *ngFor="let collection of visibleCollections" 
                  class="collection-card"
                  [class.selected]="collection.id === selectedCollectionId"
                  (click)="selectCollection(collection.id)">
               {{ collection.name }}
            </div>
         </div>

         <div *ngIf="collections.length > 3" class="toggle-btn-container">
            <button class="toggle-btn" (click)="toggleShowAll()">
               {{ showAll ? 'Ver menos' : 'Ver más' }}
            </button>
         </div>

      </div>
      <div class="tasks-section">
         <h2 class="section-title"> MIS NOTAS </h2>
         <div class="notes-container">
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
            
            <div *ngFor="let note of notes" class="note-card active-task">
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
                     <span class="task-category" *ngIf="note.collectionId">
                        <i class="fas fa-folder"></i>
                        {{ note.collectionName }}
                     </span>
                     <span class="task-date">
                        <i class="fas fa-calendar"></i>
                        Actualizado: {{ note.updatedAt | date:'dd/MM/yyyy hh:MM' }}
                     </span>
                  </div>
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarLoggedComponent, FooterComponent, ChatComponent, SidebarComponent]
})
export class NoteListComponent implements OnInit {
   notes: NoteResponse[] = [];
   collections: CollectionResponse[] = [];
   loading = false;
   searchTerm = '';
   //selectedCollectionName = '';
   sortBy = '';
   sortDirection: 'asc' | 'desc' = 'asc';
   currentPage = 0;
   pageSize = 15;
   totalPages = 0;
   totalElements = 0;
   user = JSON.parse(localStorage.getItem('user') || '{}');
   selectedCollectionId: number = 0;
   showModal = false;
   newCollectionName = '';
   showAll = false; 
   visibleCollections: CollectionResponse[] = [];
   editCol: boolean = false;
   
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
      this.updateVisibleCollections();
    });
  }
  

   loadCollections(callback?: () => void): void {
      this.collectionService.getCollections(this.user.id).subscribe({
         next: (collections: CollectionResponse[]) => {
         this.collections = collections;
         if (callback) callback();
         },
         error: (error) => {
         //console.error('Error al cargar colecciones:', error);
         //this.showError('Error al cargar las colecciones');
         }
      });
      this.updateVisibleCollections();
   }

   loadNotes(): void {
      this.loading = true;
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
      //console.log('_Usuario actual:', this.user);
      
      this.noteService.getNotes(
         this.user.id,
         this.selectedCollectionId === 0 ? undefined : this.selectedCollectionId,
         this.searchTerm.trim().length === 0 ? undefined : this.searchTerm.trim(),
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
          //console.error('Error al cargar notas(getNotes):', error);
          this.showError('Error al cargar las notas');
          this.loading = false;
        }
      });
  }

  private processNotesResponse(response: any): void {
    this.notes = response.content;
    this.totalPages = response.totalPages;
    this.totalElements = response.totalElements;
  }

  onSearch(): void {
    this.currentPage = 0;
    this.selectedCollectionId = 0;
    this.loadNotes();
  }

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
    this.selectedCollectionId = 0;
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
    this.selectedCollectionId = 0;
    this.sortBy = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.loadNotes();
  }

  hasActiveFilters(): boolean {
      return !!(this.searchTerm || this.selectedCollectionId || this.sortBy);
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
            //console.error('Error al eliminar la nota:', error);
            this.showError('Error al eliminar la nota');
          }
        });
      }
    });
  }
   selectCollection(id: number) {
      this.selectedCollectionId = id;
      this.newCollectionName = this.collections.find(c => c.id === id)?.name || '';

      //console.log('Colección seleccionada ID:', id, this.newCollectionName);
      this.loadNotes();

      this.showAll = false;
      this.updateVisibleCollections();
   }


openModal(editMode:boolean = false) {
   this.showModal = true;
   if (editMode && this.selectedCollectionId === 0) {
      Swal.fire('Advertencia', 'Por favor, selecciona una colección para editar', 'warning');
      this.showModal = false;  
   } else if (!editMode && this.selectedCollectionId !== 0) {
      this.newCollectionName = '';
   }
   this.editCol = editMode;
}

closeModal() {
   this.showModal = false;
   if (this.editCol) {
      this.editCol = false;
   }
   this.selectedCollectionId = 0;
   this.newCollectionName = '';
   this.updateVisibleCollections();
}

createNewCollection() {
  if (this.newCollectionName.trim()) {
    //console.log('Crear colección con nombre:', this.newCollectionName);
    let newCollection:CollectionRequest = {
      name:this.newCollectionName,
      userId: this.user.id
    };
    //console.log('Nueva colección:', newCollection);
   this.collectionService.createCollection(newCollection).subscribe({
      next: (response) => {
      Swal.fire('Éxito', 'Colección creada correctamente.', 'success');
      this.loadCollections(() => {
         this.loadNotes();
         this.updateVisibleCollections();
      });
      },
      error: (error) => {
      //console.error('Error al crear la colección:', error);
         this.showError('Error al crear la colección');
      }
   });
    this.closeModal();
  } else {
    this.showError('El nombre no puede estar vacío');
  }
}

updateVisibleCollections() {
  this.visibleCollections = this.showAll
    ? this.collections
    : this.collections.slice(0, 3);
}

toggleShowAll() {
  this.showAll = !this.showAll;
  this.updateVisibleCollections();
}

editCollection(){
   if (this.selectedCollectionId !== 0) {
      let collection:CollectionRequest = {
         name:this.newCollectionName,
         userId: this.user.id
      };

      this.collectionService.updateCollection(this.selectedCollectionId, collection).subscribe({
         next: (response) => {
            Swal.fire('Éxito', 'Colección actualizada correctamente.', 'success');
            this.loadCollections(() => {
               this.loadNotes();
               this.updateVisibleCollections();
            });
         },
         error: (error) => {
            console.error('Error al actualizar la colección:', error);
            this.showError('Error al actualizar la colección');
         }
      });
      this.closeModal();
   } else {
      this.showError('Por favor, selecciona una colección para editar');
   }  
   
}

deleteCollection() {
   if(this.selectedCollectionId !== 0) {
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
            this.collectionService.deleteCollection(this.selectedCollectionId).subscribe({
               next: () => {
                  Swal.fire('Eliminado', 'La colección ha sido eliminada correctamente.', 'success');
                  this.loadCollections(() => {
                     this.loadNotes();
                     this.updateVisibleCollections();
                  });
                  this.selectedCollectionId = 0;
               },
               error: (error) => {
                  //console.error('Error al eliminar la colección_:', error);
                  this.showError(error.error.message);
               }
            });
         }
      });
   }
}

  private showError(message: string): void {
    Swal.fire('Error', message, 'error');
  }
}
