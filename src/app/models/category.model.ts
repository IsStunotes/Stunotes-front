export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request para crear/actualizar categoría
export interface CategoryRequest {
  name: string;
}

// Response de categoría del backend
export interface CategoryResponse {
  id: number;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

// Response paginada genérica
export interface PagedResponse<T> {
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
