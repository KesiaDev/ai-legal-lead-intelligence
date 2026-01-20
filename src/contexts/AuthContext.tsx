import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginDto, RegisterDto } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

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

// Em desenvolvimento, cria um usuário mock
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const mockUser: User = {
  id: 'dev-user-1',
  email: 'dev@example.com',
  name: 'Usuário Desenvolvimento',
  role: 'admin',
};
const mockTenant: Tenant = {
  id: 'dev-tenant-1',
  name: 'Escritório Dev',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isDevelopment ? mockUser : null);
  const [tenant, setTenant] = useState<Tenant | null>(isDevelopment ? mockTenant : null);
  const [isLoading, setIsLoading] = useState(!isDevelopment);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Em desenvolvimento, não precisa verificar token
    if (isDevelopment) {
      setIsLoading(false);
      return;
    }

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
      
      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${response.data.user.name}!`,
        variant: 'default',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message 
        || err.message 
        || 'Erro ao fazer login. Verifique suas credenciais e se o backend está online.';
      setError(errorMessage);
      
      toast({
        title: 'Erro ao fazer login',
        description: errorMessage,
        variant: 'destructive',
      });
      
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
      
      toast({
        title: 'Conta criada com sucesso!',
        description: `Bem-vindo ao SDR Advogados, ${response.data.user.name}!`,
        variant: 'default',
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message 
        || err.message 
        || 'Erro ao criar conta. Verifique os dados e se o backend está online.';
      setError(errorMessage);
      
      toast({
        title: 'Erro ao criar conta',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setTenant(null);
    
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
      variant: 'default',
    });
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
