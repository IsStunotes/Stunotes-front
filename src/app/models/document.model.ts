import { CommentRequest, CommentResponse } from './comment.model';
export interface DocumentRequest {
  title: string;
  description: string;
  repositoryId: number;  
  userId: number;       
  version: number;       
  dateCreated?: string;  
  comments?: CommentRequest[];
}

export interface DocumentResponse {
  id: number;
  title: string;
  description: string;
  repositoryId: number;
  userId: number;
  version: number;
  dateCreated: string;      
  comments: CommentResponse[] ; 
}