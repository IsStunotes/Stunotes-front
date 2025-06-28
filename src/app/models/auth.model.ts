export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    lastName: string;
  }
  
  export interface AuthResponse {
    userId(arg0: string, userId: any): unknown;
    id: number;
    email: string;
    token: string;
    name: string;
    lastName: string;
    role: string;
  }
  