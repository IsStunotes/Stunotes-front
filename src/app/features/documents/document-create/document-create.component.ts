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
      <h2>Crear nuevo documento</h2>

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

        <button type="submit" [disabled]="docForm.invalid">Guardar</button>
        <button type="button" (click)="cancelar()">Cancelar</button>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 2rem;
      max-width: 600px;
      margin: 2rem auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
    label {
      display: block;
      margin-bottom: 1rem;
      font-weight: bold;
    }
    input, textarea {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.3rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      margin-top: 1rem;
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      font-weight: bold;
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
