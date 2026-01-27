import axios from 'axios';

// URL correta da API - sempre usar esta
const CORRECT_API_URL = 'https://api.sdrjuridico.com.br';

// Verificar variável de ambiente, mas garantir que nunca use URL antiga
let envApiUrl = import.meta.env.VITE_API_URL;

// Se a variável de ambiente contém URL antiga, ignorar e usar a correta
if (envApiUrl && (envApiUrl.includes('sdradvogados.up.railway.app') || envApiUrl.includes('railway.app/api'))) {
  console.warn('⚠️ VITE_API_URL contém URL antiga, usando URL correta:', envApiUrl);
  envApiUrl = undefined;
}

// Usar variável de ambiente se válida, senão usar URL correta
const API_URL = envApiUrl && !envApiUrl.includes('railway.app') 
  ? envApiUrl 
  : CORRECT_API_URL;

// Log para debug - verificar qual URL está sendo usada
console.log('🔍 API Client Config:', {
  VITE_API_URL_ENV: import.meta.env.VITE_API_URL,
  API_URL_USED: API_URL,
  isCorrect: API_URL === CORRECT_API_URL,
});

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
