import { Component, OnInit } from '@angular/core';
import { RepositoryService } from '../../services/repository.service';
import { RepositoryRequest, RepositoryResponse } from '../../models/repository.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { NavbarLoggedComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";

@Component({
  standalone: true,
  selector: 'app-repository-list',
  template: `
   <app-navbar></app-navbar>
   <app-sidebar></app-sidebar>
<div class="main-content">

<div *ngIf="loading" class="loading">Cargando repositorios...</div>
<div *ngIf="error" class="error">{{ error }}</div>

<div *ngIf="!loading">
<div class="task-header">
  <div class="header-left">
    <button class="back-btn" (click)="cancelar()">
      <i class="fas fa-arrow-left"></i> Atrás
    </button>
    <button class="new-task-btn" (click)="crearRepositorio()">
      <i class="fas fa-plus"></i> Nuevo Repositorio
    </button>
  </div>
  <div class="search-container">
    <input
      type="number"
      placeholder="Buscar por ID de repositorio"
      [(ngModel)]="filtroId"
      class="search-input"
    />
    <button (click)="buscarPorId()" class="search-btn">🔍</button>
    <button (click)="limpiarFiltro()" *ngIf="filtroId" class="clear-btn">❌</button>
  </div>
</div>

      <div *ngIf="repositories.length === 0 && !loading" class="no-repos-msg">
    Aún no se ha creado un repositorio
  </div>

  <ng-container *ngFor="let repo of repositories">
  <div class="repo-block">
    <h2>Repositorio {{ repo.id }}</h2>
    <div class="repo-actions">
      <button class="create-btn" (click)="crearDocumento(repo.id)">
        + Crear nuevo documento
      </button>
      <button class="delete-btn" (click)="eliminarRepositorio(repo.id)">
        🗑️ Eliminar repositorio
      </button>
    </div>
    <div class="document-grid">
      <div *ngFor="let doc of repo.documents" class="document-card-wrapper">
        <a class="card-link" [routerLink]="['/document', doc.id, 'comments']">
          <div class="card">
            <h3>{{ doc.title }}</h3>
            <p>{{ doc.description }}</p>
            <small>
              Documento v{{ doc.version }} – {{ doc.dateCreated | date: 'yyyy-MM-dd' }}
            </small>
          </div>
        </a>
        <button class="delete-btn" (click)="eliminarDocumento(doc.id, repo.id); $event.stopPropagation();">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  </div>
</ng-container>
</div>
</div>

<app-footer></app-footer>
`,
  imports: [CommonModule, RouterModule, NavbarLoggedComponent, FooterComponent, SidebarComponent, FormsModule],
  styleUrls: ['repository-list.component.css']

})
export class RepositoryListComponent implements OnInit {
  repositories: RepositoryResponse[] = [];
  loading = false;
  error = '';
  filtroId: number | null = null;

  constructor(
    private repositoryService: RepositoryService,
    private documentService: DocumentService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.loadRepositories();
}

repositoriosOriginales: RepositoryResponse[] = [];
loadRepositories(): void {
  this.loading = true;

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    this.error = 'No hay usuario autenticado.';
    this.loading = false;
    return;
  }

  const user = JSON.parse(storedUser);

  const handler = (repos: RepositoryResponse[]) => {
    this.repositories = repos;
    this.repositoriosOriginales = repos; // <-- almacenamos una copia original
    this.loading = false;
  };

  if (user.role === 'TEACHER' || user.roleId === 2) {
    this.repositoryService.getAllRepositories().subscribe({
      next: handler,
      error: (err) => {
        console.error('Error al obtener todos los repositorios:', err);
        this.error = 'Error al cargar todos los repositorios';
        this.loading = false;
      }
    });
  } else {
    this.repositoryService.getRepositoriesByUsuarioId(user.id).subscribe({
      next: handler,
      error: (err) => {
        console.error('Error al obtener repositorios del usuario:', err);
        this.error = 'Error al cargar repositorios del usuario';
        this.loading = false;
      }
    });
  }
}

buscarPorId(): void {
  if (!this.filtroId) return;

  this.repositories = this.repositoriosOriginales.filter(repo => repo.id === this.filtroId);
}

limpiarFiltro(): void {
  this.filtroId = null;
  this.repositories = [...this.repositoriosOriginales];
}
crearDocumento(repositoryId: number): void {
  this.router.navigate(['/document/create'], {
    queryParams: { repositoryId }
  });
}
cancelar(): void {
  history.back();
}
crearRepositorio(): void {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert('No hay usuario autenticado.');
    return;
  }

  const user = JSON.parse(storedUser);

  const nuevoRepo: RepositoryRequest = {
    userId: user.id
  };
  console.log('Payload enviado al backend:', nuevoRepo);
  this.repositoryService.saveRepository(nuevoRepo).subscribe({
    next: (createdRepo) => {
  this.repositories.push(createdRepo);

 Swal.fire({
  icon: 'success',
  title: 'Repositorio creado debajo',
  text: 'Puedes empezar a agregar documentos.',
  confirmButtonText: '¡Perfecto!',
  width: '80%'
});
},
    error: (err) => {
      console.error('Error al crear repositorio:', err);
      alert('Error al crear repositorio');
    }
  });
}

eliminarRepositorio(repoId: number): void {
  Swal.fire({
    title: '¿Eliminar repositorio?',
    text: 'Se eliminará junto con todos sus documentos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#aaa',
  }).then((result) => {
    if (result.isConfirmed) {
      this.repositoryService.deleteRepository(repoId).subscribe({
        next: () => {
          this.repositories = this.repositories.filter(repo => repo.id !== repoId);
          Swal.fire({
            icon: 'success',
            title: 'Repositorio eliminado',
            text: 'El repositorio fue eliminado correctamente.',
            confirmButtonText: 'OK',
            width: '70%',
          });
        },
        error: (err) => {
          console.error('Error al eliminar repositorio:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el repositorio porque tiene documentos con COMENTARIOS .',
            confirmButtonText: 'Cerrar'
          });
        }
      });
    }
  });
}
eliminarDocumento(documentId: number, repositoryId: number): void {
  if (!confirm('¿Deseas eliminar este documento?')) {
    return;
  }

  this.documentService.deleteDocument(documentId).subscribe({
    next: () => {
      const repo = this.repositories.find(r => r.id === repositoryId);
      if (repo) {
        repo.documents = repo.documents.filter(doc => doc.id !== documentId);
      }
    },
    error: (err) => {
      console.error('Error al eliminar documento:', err);
      alert('No se pudo eliminar el documento');
    }
  });
}
}