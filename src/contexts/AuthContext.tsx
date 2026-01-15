import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthResponse } from '@/api/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; name: string; password: string; tenantName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const queryClient = useQueryClient();

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const storedToken = authApi.getToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Buscar dados do usuário quando token existe
  const { data: userData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authApi.me();
      return response.data;
    },
    enabled: !!token,
    retry: false,
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        // Tenant pode vir do user ou ser buscado separadamente
        if ((data as any).tenant) {
          setTenant((data as any).tenant);
        }
      }
    },
    onError: () => {
      // Token inválido ou expirado
      logout();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login({ email, password });
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      authApi.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setTenant(data.tenant);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; password: string; tenantName: string }) => {
      const response = await authApi.register(data);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      authApi.setToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setTenant(data.tenant);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (data: { email: string; name: string; password: string; tenantName: string }) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = () => {
    authApi.logout();
    setToken(null);
    setUser(null);
    setTenant(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
