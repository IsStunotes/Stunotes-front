import { DocumentRequest, DocumentResponse } from './document.model';


export interface RepositoryRequest {
  userId: number;
  //opcional
  documents?: DocumentRequest[];
}


export interface RepositoryResponse {
  id: number;
  documents: DocumentResponse[];
}
