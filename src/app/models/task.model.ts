export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  finishedAt?: string;
  priority: number;
  category: Category;
  user: User;
}

export interface TaskRequest {
  title: string;
  description: string;
  priority: number;
  categoryId: number;
  userId: number;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  finishedAt?: string;
  priority: number;
  category: Category;
  user: User;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;  
  size: number;
  number: number;
}