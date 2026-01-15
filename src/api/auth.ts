import api from './client';

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  tenantName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
  };
}

export const authApi = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>('/register', data),
  
  login: (data: LoginDto) =>
    api.post<AuthResponse>('/login', data),
  
  me: () =>
    api.get<{ user: any }>('/me'),
  
  logout: () => {
    localStorage.removeItem('auth_token');
  },
  
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
};
