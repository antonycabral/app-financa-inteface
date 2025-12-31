export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  access_token?: string; // opcional, para compatibilidade
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOffline: boolean;
}
