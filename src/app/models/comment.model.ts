export interface CommentRequest {
  contenido: string;
  documentId: number;
  userId?: number;
}


export interface CommentResponse {
  id: number;
  content: string;
  fecha: string;
  documentId: number;
  userId: number;
  username?: string;

}


