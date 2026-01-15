import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginDto, RegisterDto } from '@/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Tenant {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há token salvo e buscar dados do usuário
    const token = authApi.getToken();
    if (token) {
      authApi.me()
        .then((response) => {
          setUser(response.data.user);
          // O tenant pode vir na resposta ou precisar ser buscado separadamente
          if (response.data.tenant) {
            setTenant(response.data.tenant);
          }
        })
        .catch(() => {
          // Token inválido, limpar
          authApi.logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginDto) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authApi.login(data);
      authApi.setToken(response.data.token);
      setUser(response.data.user);
      setTenant(response.data.tenant);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authApi.register(data);
      authApi.setToken(response.data.token);
      setUser(response.data.user);
      setTenant(response.data.tenant);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
