import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';
import { DocumentRequest } from '../../../models/document.model';
import { NavbarLoggedComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RepositoryService } from '../../../services/repository.service';
import Swal from 'sweetalert2';
@Component({
  standalone: true,
  selector: 'app-document-create',
  template: `
    <app-sidebar></app-sidebar>

    <div class="form-container">
      <app-navbar></app-navbar>

      <div class="form-wrapper">
        <h2 class="form-title">📄 Crear Nuevo Documento</h2>

        <form (ngSubmit)="guardarDocumento()" #docForm="ngForm">
          <label>
            Título:
            <input type="text" [(ngModel)]="documento.title" name="title" required />
          </label>

          <label>
            Contenido:
            <textarea [(ngModel)]="documento.description" name="description"></textarea>
          </label>

          <label>
            Versión:
            <input type="number" [(ngModel)]="documento.version" name="version" required min="1" />
          </label>
          <label>
  Selecciona Repositorio:
  <select [(ngModel)]="documento.repositoryId" name="repositoryId" required>
    <option *ngFor="let repo of listaRepositorios" [value]="repo.id">
      Repositorio {{ repo.id }}
    </option>
  </select>
</label>
          <div class="buttons">
            <button class="btn btn-primary" type="submit" [disabled]="docForm.invalid">Guardar</button>
            <button class="btn btn-danger" type="button" (click)="cancelar()">Cancelar</button>
          </div>
        </form>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    :host {
      background: rgba(240, 240, 240, 0.7);
      font-family: 'Poppins', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: start;
      justify-content: flex-start;
      padding: 2rem;
    }

    .form-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .form-wrapper {
      margin: 2rem auto;
      padding: 2rem;
      max-width: 600px;
      width: 100%;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }

    .form-title {
      text-align: center;
      font-size: 1.8rem;
      margin-bottom: 2rem;
      font-weight: 600;
      color: #4b5563;
      position: relative;
    }

    .form-title::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: #7c3aed;
      margin: 8px auto 0;
      border-radius: 2px;
    }

    label {
      display: block;
      margin-bottom: 1.5rem;
      font-weight: 500;
      color: #374151;
    }

    input, textarea {
      width: 100%;
      padding: 0.6rem 0.75rem;
      margin-top: 0.4rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      font-weight: 600;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      color: #fff;
    }

    .btn-primary {
      background-color: #7c3aed;
    }

    .btn-primary:hover {
      background-color: #654de0;
    }

    .btn-danger {
      background-color: #ef4444;
    }

    .btn-danger:hover {
      background-color: #dc2626;
    }
  `],
  imports: [CommonModule, FormsModule, NavbarLoggedComponent, FooterComponent, SidebarComponent]
})
export class DocumentCreateComponent implements OnInit {
  documento: DocumentRequest = {
    title: '',
    description: '',
    version: 1,
    repositoryId: 0,
    userId: 0
  };

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private repositoryService: RepositoryService
  ) {}
  listaRepositorios: any[] = [];
  ngOnInit(): void {
  // Obtener el ID del repositorio desde los queryParams
  this.route.queryParams.subscribe(params => {
    const repoId = Number(params['repositoryId']);
    if (!isNaN(repoId) && repoId > 0) {
      this.documento.repositoryId = repoId;
    }
  });

  // Obtener lista de repositorios del usuario logueado
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    this.repositoryService.getRepositoriesByUsuarioId(user.id).subscribe({
      next: (repos) => {
        this.listaRepositorios = repos;
      },
      error: (err) => {
        console.error('Error al obtener repositorios del usuario', err);
      }
    });
  }
}

  guardarDocumento(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('No hay usuario autenticado. No se puede crear el documento.');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (!user?.id) throw new Error();

      this.documento.userId = user.id;

      this.documentService.createDocument(this.documento).subscribe({
        next: () => {
          Swal.fire({
  icon: 'success',
  title: 'Documento creado correctamente',
  text: 'Puedes verlo ahora en el repositorio.',
  confirmButtonText: '¡A verlo!',
  width: '80%'
}).then(() => {
  history.back(); // solo vuelve cuando el usuario confirme
});

        },
        error: (err) => {
          console.error('Error al crear documento:', err);
          alert('Ocurrió un error al crear el documento');
        }
      });
    } catch {
      alert('Error al obtener datos del usuario');
    }
  }

  cancelar(): void {
    history.back();
  }
}