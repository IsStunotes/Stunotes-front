import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { TaskResponse } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { NavbarLoggedComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentResponse } from '../../models/document.model';
import { RepositoryService } from '../../services/repository.service';
import { RepositoryResponse } from '../../models/repository.model';
import { NoteService } from '../../services/note.service';
import { NoteResponse } from '../../models/note.model';
import { ChatComponent } from '../../features/chat/chat.component';
import { SidebarComponent } from "../components/sidebar/sidebar.component";

@Component({
  selector: 'app-home',
  template: `
   <app-navbar></app-navbar>
   <app-sidebar></app-sidebar>
<div class="dashboard-wrapper">
  <div class="welcome-section animate-fade">
    <h1 class="animate-drop">{{saludo}}, <span class="username">{{ user.name }}</span></h1>
    <p class="subtitle animate-rise">
      {{ user.role === 'TEACHER' ? 'Inspira y transforma vidas a través de la educación.' : 'Organiza tus actividades y mejora tu aprendizaje día a día.' }}
    </p>
  </div>

  <section class="task-section">
    <div class="task-section-header">
      <h2>📌 Tareas por cumplir</h2>
      <button class="create-task-btn" (click)="crearNuevaTarea()">
        <span class="plus-icon">+</span> Nueva tarea
      </button>
    </div>

    <div *ngIf="nextTasks.length > 0; else noTasks">
      <div *ngFor="let task of nextTasks" class="task-card" (click)="irADetalleTarea(task.id)">
        <div class="task-info">
          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-date">Creado: {{ task.createdAt | date:'dd/MM/yyyy' }}</p>
        </div>
        <i class="fas fa-chevron-right arrow-icon"></i>
      </div>
    </div>

    <ng-template #noTasks>
      <p class="no-task-msg">No tienes tareas creadas.</p>
    </ng-template>
  </section>

  <section class="repository-section">
  <div class="repository-section-header">
    <h2>📁 Repositorios</h2>
    <button class="create-task-btn" (click)="crearRepositorio()">
      <span class="plus-icon">+</span> Ver repositorios
    </button>
  </div>

  <div *ngIf="repositorios.length > 0; else noRepos" class="repository-list">
    <div *ngFor="let repo of repositorios" class="repository-card" (click)="irADetalleRepositorio(repo.id)">
      <h3 class="task-title">Repositorio {{ repo.id }}</h3>
      <p class="task-date">Documentos: {{ repo.documents.length || 0 }}</p>
    </div>
  </div>

  <ng-template #noRepos>
    <p class="no-task-msg">No tienes repositorios creados.</p>
  </ng-template>
</section>

  <section class="task-section">
    <div class="task-section-header">
      <h2>📄 Documentos creados</h2>
    </div>

    <div *ngIf="documentos.length > 0; else noDocs" class="document-carousel-wrapper">
      <div class="document-carousel">
        <div *ngFor="let doc of documentos" class="document-card" (click)="irADetalleDocumento(doc.id)">
          <h3 class="task-title">{{ doc.title }}</h3>
          <p class="task-date">Versión: {{ doc.version }}</p>
        </div>
      </div>
      <div class="carousel-arrow right"><i class="fas fa-chevron-right"></i></div>
    </div>

    <ng-template #noDocs>
      <p class="no-task-msg">No tienes documentos creados.</p>
    </ng-template>
  </section>
  
  <section class="note-section">
    <div class="note-title">
      <h2>📌 Mis Notas</h2>
      <button class="note-new-btn" (click)="newNote()">
        <span class="plus-icon">+</span> Nueva Nota
      </button>
    </div>

    <div class="note-cards" *ngIf="notes.length > 0; else noNotes">
      <div *ngFor="let note of notes" class="note-card" (click)="irADetalleNote(note.id)">
        <div class="">
          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-content">Creado: {{ note.content }}</p>
          <p class="task-date">Actualizado: {{ note.updatedAt | date:'dd/MM/yyyy hh:MM' }}</p>
        </div>
        <i class="fas fa-chevron-right arrow-icon"></i>
      </div>
    </div>

    <ng-template #noNotes>
      <p class="no-task-msg">No tienes notas creadas.</p>
    </ng-template>
  </section>
</div>
<app-floating-chat></app-floating-chat>
<app-footer></app-footer>

  `,
  styleUrls: ['./homepage.component.css'],
  standalone: true,
  imports: [CommonModule, NavbarLoggedComponent, FooterComponent, SidebarComponent, ChatComponent]
})
export class HomeComponent implements OnInit {
  user: any = null;
  saludo: string = '';
  nextTasks: TaskResponse[] = [];
  documentos: DocumentResponse[] = [];
  repositorios: RepositoryResponse[] = [];
  notes: NoteResponse[] = [];

  constructor(
    private taskService: TaskService,
    private documentService: DocumentService,
    private repositoryService: RepositoryService,
    private router: Router,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    this.generarSaludo();
    this.obtenerTareasProximas();
    this.obtenerDocumentos();
    this.obtenerRepositorios();
    this.getNotes();
  }

  generarSaludo(): void {
    const hora = new Date().getHours();
    if (hora < 12) {
      this.saludo = 'Buenos días';
    } else if (hora < 18) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }
  }

  obtenerTareasProximas(): void {
    this.taskService.getTasks(0, 5, undefined, undefined, 'createdAt', 'asc').subscribe({
        next: (res) => {
          this.nextTasks = res.content
            .filter((task: TaskResponse) => task.createdAt)
            .slice(0, 5);
        },
        error: (err) => {
          console.error('Error al cargar tareas próximas:', err);
        }
      });     
  }

  obtenerRepositorios(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.repositoryService.getRepositoriesByUsuarioId(user.id).subscribe({
        next: (repos) => this.repositorios = repos,
        error: (err) => console.error('Error al obtener repositorios:', err)
      });
    }
  }
  irADetalleTarea(taskId: number): void {
    this.router.navigate(['/tasks', taskId, 'edit']); 
  }
  crearNuevaTarea(): void {
    this.router.navigate(['/tasks/createTask']);
  }

  obtenerDocumentos(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('Usuario actual:', user);
    if (user && user.id) {
      this.documentService.getDocumentsByUserId(user.id).subscribe({
        next: (docs) => this.documentos = docs.slice(0, 5),
        error: (err) => console.error('Error al obtener documentos:', err)
      });
    }
  }

  irADetalleDocumento(documentId: number): void {
    this.router.navigate([`/document/${documentId}/comments`]);
  }

  crearRepositorio(): void {
    this.router.navigate(['/repositorios/list']);
  }

  irADetalleRepositorio(repoId: number): void {
    this.router.navigate([`/repositories/${repoId}`]);
  }

  newNote(): void {
    this.router.navigate(['/notes/createNote']);
  }
  irADetalleNote(noteId: number): void {
    this.router.navigate(['/notes', noteId, 'edit']); 
  }

  getNotes():void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.noteService.getNotes(Number(user.id), undefined,undefined, 0, 5, 'createdAt', 'asc').subscribe({
        next: (res) => {
          this.notes = res.content
            .filter((note: NoteResponse) => note.createdAt)
            .slice(0, 5);
        },
        error: (err) => {
          console.error('Error al cargar las notas:', err);
        }
    });    
  }
}
