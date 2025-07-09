import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { NoteRequest, NoteResponse } from '../../../../models/note.model';
import { NoteService } from '../../../../services/note.service';

import { CollectionResponse } from '../../../../models/collection.model';
import { CollectionService } from '../../../../services/collection.service';

import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { NavbarLoggedComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SidebarComponent, NavbarLoggedComponent],
  template: `
   <app-navbar></app-navbar>
   <app-sidebar></app-sidebar>
   <div class="container">
      <div class="form-container">
         <div class="form-header">
            <h1 class="form-title">
               <i class="fas fa-sticky-note"></i>
               {{ isEditMode ? 'Editar Nota' : 'Nueva Nota' }}
            </h1>
            <button class="back-btn" (click)="onCancel()" type="button">
               <i class="fas fa-arrow-left"></i>
               Volver
            </button>
         </div>

      <div *ngIf="loading" class="loading-container">
         <div class="loading-spinner"></div>
         <p>Cargando nota...</p>
      </div>

      <div *ngIf="!loading" class="form-content">
         <form [formGroup]="noteForm" (ngSubmit)="onSubmit()" class="note-form">

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
               placeholder="Ingresa el título de la nota">
            <div *ngIf="isFieldInvalid('title')" class="error-message">
               {{ getFieldError('title') }}
            </div>
            </div>

            <div class="form-group">
            <label for="content" class="form-label">
               <i class="fas fa-align-left"></i>
               Contenido *
            </label>
            <textarea
               id="content"
               formControlName="content"
               class="form-textarea"
               [class.error]="isFieldInvalid('content')"
               placeholder="Escribe el contenido de la nota..."
               rows="6">
            </textarea>
            <div *ngIf="isFieldInvalid('content')" class="error-message">
               {{ getFieldError('content') }}
            </div>
            </div>

            <div class="form-group">
            <label for="collectionId" class="form-label">
               <i class="fas fa-folder-open"></i>
               Colección *
            </label>
            <select
               id="collectionId"
               formControlName="collectionId"
               class="form-select"
               [class.error]="isFieldInvalid('collectionId')">
               <option value="">Selecciona una colección</option>
               <option *ngFor="let collection of collections" [value]="collection.id">
                  {{ collection.name }}
               </option>
            </select>
            <div *ngIf="isFieldInvalid('collectionId')" class="error-message">
               {{ getFieldError('collectionId') }}
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
               [disabled]="noteForm.invalid || submitting">
               <div *ngIf="submitting" class="btn-spinner"></div>
               <i *ngIf="!submitting" class="fas fa-save"></i>
               {{ submitting ? 'Guardando...' : (isEditMode ? 'Actualizar Nota' : 'Crear Nota') }}
            </button>
            </div>

         </form>
      </div>
   </div>
</div>
  `,
  styleUrls: ['./note-form.component.css']
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  collections: CollectionResponse[] = [];
  isEditMode = false;
  noteId: number | null = null;
  loading = false;
  submitting = false;
  user = JSON.parse(localStorage.getItem('user') || '{}'); // Obtener el usuario del localStorage

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private collectionService: CollectionService,
    private route: ActivatedRoute,
    private router: Router
  ){
      this.noteForm = this.createForm();
   };

   ngOnInit(): void {

      this.noteId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
      this.isEditMode = !!this.noteId;

      this.loadCollections( ()=> {
         if (this.isEditMode && this.noteId) {
            this.loadNote(this.noteId);
         }
      });
   }

   createForm(): FormGroup {
      return this.fb.group({
         title: ['', [Validators.required, Validators.maxLength(100)]],
         content: ['', Validators.required],
         collectionId: ['', Validators.required]
         //agregar userId
      });
   }

   loadCollections(callback: () => void): void {
      this.collectionService.getCollections(this.user.id).subscribe({
         next: (collections: CollectionResponse[]) => {
            this.collections = collections;
            if (callback) callback();
         },
         error: (error) => {
            console.log('note-form.component.ts -> Error al cargar las colecciones:', error);
            this.showError('Error al cargar las colecciones');
         }
      });
   }

   loadNote(noteId: number): void {
      this.loading = true;
      this.noteService.getNoteById(noteId).subscribe({
         next: (note: NoteResponse) => {
            this.noteForm.patchValue({
               title: note.title,
               content: note.content,
               collectionId: note.collectionId
            });
            this.loading = false;
         },
         error: (error) => {
            console.error('note-form.component.ts -> Error al cargar la nota:', 'error');
            this.showError('Error al cargar la nota');
            this.loading = false;
            this.router.navigate(['/notes']);
         }
      });
   }

   onSubmit(): void {
      if (this.noteForm.invalid) {
         this.markFormGroupAsTouched();
         Swal.fire('Error', 'Por favor, completa todos los campos requeridos.', 'error');
         return;
      }

      if (!this.submitting) {
         this.submitting = true;
         const noteData: NoteRequest = {
            title: this.noteForm.value.title,
            content: this.noteForm.value.content,
            collectionId: this.noteForm.value.collectionId
         };

         if (this.isEditMode && this.noteId) {
            console.log('note-form.component.ts -> Actualizando nota con ID:', this.noteId, noteData);
            this.noteService.updateNote(this.noteId, noteData).subscribe({
               next: () => {
                  Swal.fire('Éxito', 'Nota actualizada correctamente.', 'success');
                  this.router.navigate(['/notes']);
               },
               error: (error) => {
                  console.error('note-form.component.ts -> Error al actualizar la nota:', error);
                  this.submitting = false;
                  this.showError('Error al actualizar la nota');
               }
            });
         } else {
            this.noteService.createNote(noteData).subscribe({
               next: () => {
                  this.submitting = false;
                  Swal.fire('Éxito', 'Nota creada correctamente.', 'success') ;
                  this.router.navigate(['/notes']);
               },
               error: (error) => {
                  console.error('note-form.component.ts -> Error al crear la nota:', error);
                  this.submitting = false;
                  this.showError('Error al crear la nota');
               }
            });
         }
      }
   }

   onCancel(): void {
      Swal.fire({
         title: 'Cancelar',
         text: '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonText: 'Sí, cancelar',
         cancelButtonText: 'No, seguir editando'
      }).then((result) => {
         if (result.isConfirmed) {
            this.router.navigate(['/notes']);
         }
      });
   } 

   private markFormGroupAsTouched(): void {
      Object.keys(this.noteForm.controls).forEach(field => {
         const control = this.noteForm.get(field);
         control?.markAsTouched();
      });
   }

   isFieldInvalid(fieldName: string): boolean {
      const field = this.noteForm.get(fieldName);
      return !!(field && field.invalid && (field.dirty || field.touched));
   }

   getFieldError(fieldName: string): string {
    const field = this.noteForm.get(fieldName);
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
         content: 'El contenido',
         collectionId: 'La colección'
         //agregar userId
      };
      return labels[fieldName] || fieldName;
   }

   private showError(message: string): void {
      Swal.fire('Error', message, 'error');
   }
}