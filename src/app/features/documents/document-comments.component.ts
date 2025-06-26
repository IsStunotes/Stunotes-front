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

@Component({
  standalone: true,
  selector: 'app-document-comments',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
 <div class="document" *ngIf="documento">
  <h2>{{ documento.title }}</h2>
  <p>{{ documento.description }}</p>
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
      </div>
    </div>

    <ng-template #sinComentarios>
      <p>No hay comentarios aún.</p>
    </ng-template>

   <div class="new-comment">
  <input type="text" [(ngModel)]="nuevoComentario" placeholder="Escribe un comentario..." />
  <button (click)="crearComentario()">Enviar</button>
</div>
  </div>
</div>
  `,
  styleUrls: ['document-comments.component.css']
})
export class DocumentCommentsComponent implements OnInit {
  documentId!: number;
  comentarios: CommentResponse[] = [];
  nuevoComentario: string = '';
  documento!: DocumentResponse;

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
    alert('El comentario no puede estar vacío');
    return;
  }

  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    alert('Debes iniciar sesión para comentar');
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
      alert('Error al crear el comentario');
    }
  });
}





 }
