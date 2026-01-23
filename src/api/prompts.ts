/**
 * API para gerenciar prompts do agente IA
 */

import api from './client';

export interface AgentPrompt {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'ativo' | 'inativo';
  provider: 'OpenAI' | 'Google';
  model: string;
  content: string;
  temperature?: number;
  maxTokens?: number;
  description?: string;
  objective?: string;
  limits?: string[];
  tone?: string;
  outputSchema?: string;
}

export interface PromptsResponse {
  prompts: AgentPrompt[];
  total: number;
}

export const promptsApi = {
  /**
   * Lista todos os prompts do tenant
   */
  list: async (): Promise<PromptsResponse> => {
    const response = await api.get<PromptsResponse>('/api/prompts');
    return response.data;
  },

  /**
   * Obtém prompt específico por tipo
   */
  getByType: async (type: string): Promise<AgentPrompt> => {
    const response = await api.get<{ prompt: AgentPrompt }>(`/api/prompts/${type}`);
    return response.data.prompt;
  },

  /**
   * Salva ou atualiza prompt
   */
  save: async (prompt: Omit<AgentPrompt, 'id'>): Promise<AgentPrompt> => {
    const response = await api.post<{ prompt: AgentPrompt; message: string }>('/api/prompts', prompt);
    return response.data.prompt;
  },

  /**
   * Atualiza prompt existente
   */
  update: async (id: string, prompt: Partial<AgentPrompt>): Promise<AgentPrompt> => {
    // Por enquanto, usa save que cria ou atualiza
    const response = await api.post<{ prompt: AgentPrompt; message: string }>('/api/prompts', {
      ...prompt,
      id, // Incluir ID para atualização
    });
    return response.data.prompt;
  },

  /**
   * Deleta prompt
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/prompts/${id}`);
  },
};
