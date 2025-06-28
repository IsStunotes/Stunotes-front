export interface Collection {
   id: number;
   name: string;
}

export interface Note {
   id: number;
   title: string;
   content: string;
   createdAt?: string;
   updatedAt?: string;
   collection: Collection;
}

export interface NoteRequest {
   title: string;
   content: string;
   collectionId: number;
}
export interface NoteResponse {
   id: number;
   title: string;
   content: string;
   createdAt: string;
   updatedAt?: string;
   collection: Collection;
}

export interface PagedResponse<T> {
   content: T[];
   totalPages: number;
   totalElements: number;
   size: number;
   number: number;
}
