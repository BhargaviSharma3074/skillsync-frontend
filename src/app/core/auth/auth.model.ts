export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN' | 'LEARNER' | 'MENTOR' | 'ADMIN';
  status?: string;
  skills?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;       // email
  userId: number;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
}