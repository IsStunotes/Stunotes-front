export interface Collection {
   id: number;
   name: string;
   createdAt?: string;
}

// Estructura de solicitud para crear/actualizar una colección
export interface CollectionRequest {
   name: string;
}

// Estructura de respuesta del backend para una colección
export interface CollectionResponse {
   id: number;
   name: string;
   createdAt: string;
}

export interface PagedResponse<T>{
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}