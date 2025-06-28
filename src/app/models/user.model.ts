export interface UserProfile {
    id: number;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    name: string;
    lastName: string;
  }
  