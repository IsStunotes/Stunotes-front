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
  <div class="form-layout">
    <app-sidebar></app-sidebar>

    <div class="form-container">
      <app-navbar></app-navbar>

      <div class="form-wrapper">
        <div class="top-bar">
  <button class="btn btn-secondary" (click)="cancelar()">← Volver</button>
</div>
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
    </div>
  </div>
  <app-footer></app-footer>
`,
 styles: [`
  :host {
    background: #fff;
    font-family: 'Poppins', sans-serif;
  }

  .form-layout {
    display: flex;
    height: 60rem;
  }

  app-sidebar {
    width: 220px;
    flex-shrink: 0;
    height: 100%;
  }

  .form-container {
    flex: 2;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    padding-right: 100px; 
    overflow-y: auto;
  }

  .form-wrapper {
    margin: 30px auto;
    zoom: 1.1;
    padding: 2rem;
    max-width: 1000px;
    background:rgb(255, 255, 255);
    border-radius: 12px;
    border: 1px solid #e5e7eb;
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

  input, textarea, select {
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

    .btn-secondary {
  background-color: #654de0; /* gris suave */
  color: white;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #672f4bff;
}
  `],
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
      Swal.fire({
        icon: 'error',
        title: 'Sesión no iniciada',
        text: 'Debes iniciar sesión para crear un documento.',
        confirmButtonColor: '#6C47FF'
      });
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
          Swal.fire({
            icon: 'error',
            title: 'Error al crear documento',
            text: 'Intenta nuevamente más tarde.',
            confirmButtonColor: '#6C47FF'
          });
        }        
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de sesión',
        text: 'No se pudo obtener la información del usuario. Intenta nuevamente.',
        confirmButtonColor: '#6C47FF'
      });
    }    
  }

  cancelar(): void {
    history.back();
  }
}