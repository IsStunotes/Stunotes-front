
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommentService } from '../../services/comment.service';
import { CommentResponse } from '../../models/comment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { DocumentResponse } from '../../models/document.model';
import { CommentRequest } from '../../models/comment.model';
import { UserService } from '../../services/user.service';
import { NavbarLoggedComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-document-comments',
  imports: [CommonModule, FormsModule, NavbarLoggedComponent, FooterComponent, SidebarComponent],
  template: `
  <app-navbar></app-navbar>
  <app-sidebar></app-sidebar> 
    <button class="btn-volver" (click)="volver()">⬅ Volver</button>

    <div class="container">
      <div class="document" *ngIf="documento">
        <h2>{{ documento.title }}</h2>
       <p class="texto-descripcion">{{ documento.description }}</p>
        <p><strong>Versión {{ documento.version }}</strong></p>
      </div>

      <div class="comments-box">
        <h3 class="comments-title">COMENTARIOS</h3>

        <div *ngIf="comentarios.length > 0; else sinComentarios" class="comments-list">
          <div *ngFor="let comentario of comentarios" class="comment">
            <div class="comment-content">
              <p>{{ comentario.content }}</p>
              <small>{{ comentario.fecha | date: 'short' }}</small>
            </div>
            <div class="comment-user">
              <span>{{ comentario.username || comentario.userId }}</span>
              <div class="avatar"></div>
            </div>
            <div class="comment-actions">
              <button *ngIf="esProfesor" class="btn-delete" (click)="eliminarComentario(comentario.id)">
               X
              </button>
            </div>
          </div>
        </div>

        <ng-template #sinComentarios>
          <p>No hay comentarios aún.</p>
        </ng-template>

        <!-- SOLO PROFESORES VEN Y PUEDEN COMENTAR -->
        <div *ngIf="esProfesor" class="new-comment">
          <input type="text" [(ngModel)]="nuevoComentario" placeholder="Escribe un comentario..." />
          <button (click)="crearComentario()">Enviar</button>
          
        </div>

      </div>
    </div>

    <app-footer></app-footer>
  `,
  styleUrls: ['document-comments.component.css']
})
export class DocumentCommentsComponent implements OnInit {
  documentId!: number;
  comentarios: CommentResponse[] = [];
  nuevoComentario: string = '';
  documento!: DocumentResponse;
  esProfesor = false; 
  usuarioActual: any = null;
  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private documentService: DocumentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.documentId = +this.route.snapshot.paramMap.get('id')!;
    this.cargarComentarios();
    this.cargarDocumento();
    this.verificarRolUsuario(); // ✅ verificar si es profesor
  }

  verificarRolUsuario(): void {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    this.usuarioActual = user;
    this.esProfesor = user.role === 'TEACHER' || user.roleId === 2;
  }
}

  cargarComentarios(): void {
    this.commentService.getCommentsByDocumentId(this.documentId).subscribe({
      next: (data: CommentResponse[]) => {
        this.comentarios = data;

        this.comentarios.forEach(comentario => {
          this.userService.getUserProfileById(comentario.userId).subscribe({
            next: (user) => {
              comentario.username = `${user.name} ${user.lastName}`;
            },
            error: (err) => {
              console.error(`No se pudo cargar usuario ${comentario.userId}`, err);
              comentario.username = `Usuario ${comentario.userId}`;
            }
          });
        });
      },
      error: (err: any) => console.error('Error al obtener comentarios:', err)
    });
  }

  cargarDocumento(): void {
    this.documentService.getDocumentById(this.documentId).subscribe({
      next: (doc) => this.documento = doc,
      error: (err) => console.error('Error al obtener documento:', err)
    });
  }

  crearComentario(): void {
    if (!this.nuevoComentario.trim()) {
      Swal.fire({
        icon: 'info',
        title: 'Comentario vacío',
        text: 'El comentario no puede estar vacío.',
        confirmButtonColor: '#6C47FF'
      });
      return;
    }    

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión requerida',
        text: 'Debes iniciar sesión para comentar.',
        confirmButtonColor: '#6C47FF'
      });
      return;
    }    
    const user = JSON.parse(storedUser);

    const comentario: CommentRequest = {
      contenido: this.nuevoComentario,
      documentId: this.documentId,
      userId: user.id
    };

    this.commentService.saveComment(comentario).subscribe({
      next: (nuevoComentario) => {
        nuevoComentario.username = `${user.name} ${user.lastName}`;
        this.comentarios.push(nuevoComentario);
        this.nuevoComentario = '';
      },
      error: (err) => {
        console.error('Error al guardar comentario:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el comentario. Intenta de nuevo.',
          confirmButtonColor: '#6C47FF'
        });
      }      
    });
  }

  volver(): void {
    history.back();
  }
  eliminarComentario(idComentario: number): void {
  Swal.fire({
    title: '¿Eliminar comentario?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#e74c3c',
    cancelButtonColor: '#aaa',
  }).then((result) => {
    if (result.isConfirmed) {
      this.commentService.deleteComment(idComentario).subscribe({
        next: () => {
          this.comentarios = this.comentarios.filter(c => c.id !== idComentario);

          // Mostrar confirmación
          Swal.fire({
            icon: 'success',
            title: 'Comentario eliminado',
            text: 'El comentario fue borrado correctamente.',
            confirmButtonText: 'OK',
            width: '70%',
          });
        },
        error: (err) => {
          console.error('Error al eliminar comentario:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el comentario.',
            confirmButtonText: 'Cerrar'
          });
        }
      });
    }
  });
}

}