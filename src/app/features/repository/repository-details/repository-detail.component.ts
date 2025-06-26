import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DocumentService } from '../../../services/document.service'; 
import { DocumentResponse } from '../../../models/document.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-repository-detail',
  template: `
    <h2>Documentos del Repositorio {{ repoId }}</h2>

    <div *ngIf="loading">Cargando documentos...</div>
    <div *ngIf="error">{{ error }}</div>

    <ul *ngIf="!loading && documents.length > 0">
      <li *ngFor="let doc of documents" style="cursor:pointer;">
        {{ doc.title }} - Versión {{ doc.version }}
      </li>
    </ul>

    <div *ngIf="!loading && documents.length === 0">
      No hay documentos en este repositorio.
    </div>
  `,
  imports: [CommonModule, RouterModule]
})
export class RepositoryDetailComponent implements OnInit {
  repoId!: number;
  documents: DocumentResponse[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.repoId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.repoId) {
      this.error = 'Repositorio inválido';
      return;
    }
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.documentService.getDocumentsByRepositoryId(this.repoId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar documentos';
        this.loading = false;
      }
    });
  }
}
