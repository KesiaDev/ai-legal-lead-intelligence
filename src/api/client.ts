import axios from 'axios';

// URL correta da API - sempre usar esta
const CORRECT_API_URL = 'https://api.sdrjuridico.com.br';

// Usar variável de ambiente se válida e não contiver URLs legadas do Railway
const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL =
  envApiUrl &&
  !envApiUrl.includes('sdradvogados.up.railway.app') &&
  !envApiUrl.includes('railway.app/api')
    ? envApiUrl
    : CORRECT_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Só redireciona para login se for erro 401 (não autorizado)
    // Erros 500, 404, etc. devem ser tratados pelo componente
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('auth_token');
      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
