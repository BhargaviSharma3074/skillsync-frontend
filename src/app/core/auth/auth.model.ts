export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'LEARNER' | 'MENTOR' | 'ADMIN';
  avatarUrl?: string;
  skills?: string[];
  bio?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'LEARNER' | 'MENTOR';
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}