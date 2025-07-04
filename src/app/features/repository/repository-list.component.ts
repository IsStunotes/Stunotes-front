import { Component, OnInit } from '@angular/core';
import { RepositoryService } from '../../services/repository.service';
import { RepositoryRequest, RepositoryResponse } from '../../models/repository.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { HttpHeaders } from '@angular/common/http';
import { NavbarLoggedComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";

@Component({
  standalone: true,
  selector: 'app-repository-list',
  template: `
   <app-navbar></app-navbar>
   <app-sidebar></app-sidebar>
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
        
        <div class="search-filters">
          <div class="search-container">
            <input type="text" placeholder="Buscar..." />
            <span class="search-icon">🔍</span>
          </div>          
        </div>
  </div>
  <div *ngIf="repositories.length === 0 && !loading" class="no-repos-msg">
    Aún no se ha creado un repositorio
  </div>

  <ng-container *ngFor="let repo of repositories">
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
  </ng-container>
  <app-footer></app-footer>
</div>
  `,
  imports: [CommonModule, RouterModule, NavbarLoggedComponent, FooterComponent, SidebarComponent],
  styleUrls: ['repository-list.component.css']

})
export class RepositoryListComponent implements OnInit {
  repositories: RepositoryResponse[] = [];
  loading = false;
  error = '';

  constructor(
    private repositoryService: RepositoryService,
    private documentService: DocumentService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.loadRepositories();
}

loadRepositories(): void {
  this.loading = true;

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    this.error = 'No hay usuario autenticado.';
    this.loading = false;
    return;
  }

  const user = JSON.parse(storedUser);

  if (user.role === 'TEACHER' || user.roleId === 2) {
    // Si es profesor, obtener todos los repositorios de todos los estudiantes
    this.repositoryService.getAllRepositories().subscribe({
      next: (repos) => {
        this.repositories = repos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener todos los repositorios:', err);
        this.error = 'Error al cargar todos los repositorios';
        this.loading = false;
      }
    });
  } else {
    // Si es estudiante, obtener solo sus repositorios
    this.repositoryService.getRepositoriesByUsuarioId(user.id).subscribe({
      next: (repos) => {
        this.repositories = repos;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener repositorios del usuario:', err);
        this.error = 'Error al cargar repositorios del usuario';
        this.loading = false;
      }
    });
  }
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
    },
    error: (err) => {
      console.error('Error al crear repositorio:', err);
      alert('Error al crear repositorio');
    }
  });
}

eliminarRepositorio(repoId: number): void {
  if (!confirm('¿Estás seguro de que quieres eliminar este repositorio?')) {
    return;
  }

  this.repositoryService.deleteRepository(repoId).subscribe({
    next: () => {
      this.repositories = this.repositories.filter(repo => repo.id !== repoId);
    },
    error: (err) => {
      console.error('Error al eliminar repositorio:', err);
      alert('No se pudo eliminar el repositorio');
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
