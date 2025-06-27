import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../../services/document.service';
import { DocumentRequest } from '../../../models/document.model';


@Component({
  standalone: true,
  selector: 'app-document-create',
  template: `
    <div class="form-container">
      <h2 class="form-title">📄 Crear Nuevo Documento</h2>

      <form (ngSubmit)="guardarDocumento()" #docForm="ngForm">
        <label>
          Título:
          <input type="text" [(ngModel)]="documento.title" name="title" required />
        </label>

        <label>
          Descripción:
          <textarea [(ngModel)]="documento.description" name="description"></textarea>
        </label>

        <label>
          Versión:
          <input type="number" [(ngModel)]="documento.version" name="version" required min="1" />
        </label>

        <label>
          ID del Repositorio:
          <input type="number" [(ngModel)]="documento.repositoryId" name="repositoryId" required min="1" />
        </label>

        <div class="buttons">
          <button class="btn btn-primary" type="submit" [disabled]="docForm.invalid">Guardar</button>
          <button class="btn btn-danger" type="button" (click)="cancelar()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      background: rgba(240, 240, 240, 0.7);
      font-family: 'Poppins', sans-serif;
      backdrop-filter: blur(5px);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .form-container {
      padding: 2rem;
      max-width: 600px;
      width: 100%;
      margin: 2rem auto;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
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
  imports: [CommonModule, FormsModule]
})
export class DocumentCreateComponent {
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
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    const repoId = Number(params['repositoryId']);
    if (repoId) {
      this.documento.repositoryId = repoId;
    }
  });
}

  guardarDocumento(): void {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert('No hay usuario autenticado. No se puede crear el documento.');
    return;
  }

  const user = JSON.parse(storedUser);

  if (!user.id) {
    alert('El usuario no tiene un ID válido.');
    return;
  }

  this.documento.userId = user.id;

  this.documentService.createDocument(this.documento).subscribe({
    next: () => {
      alert('Documento creado correctamente');
      history.back();
    },
    error: (err) => {
      console.error('Error al crear documento:', err);
      alert('Ocurrió un error al crear el documento');
    }
  });
}

  cancelar(): void {
    history.back();
  }
}
