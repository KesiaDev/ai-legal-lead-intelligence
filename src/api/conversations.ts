import api from './client';

export interface Conversation {
  id: string;
  leadId: string;
  channel: 'whatsapp' | 'instagram' | 'site' | 'chat';
  status: 'active' | 'paused' | 'closed';
  assignedTo?: string;
  assignedType: 'ai' | 'human' | 'hybrid';
  slaDeadline?: string;
  messages: Message[];
  lead?: any;
  user?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderType: 'lead' | 'ai' | 'human';
  senderId?: string;
  isAI: boolean;
  metadata?: any;
  createdAt: string;
}

export interface CreateConversationDto {
  leadId: string;
  channel: 'whatsapp' | 'instagram' | 'site' | 'chat';
  assignedType?: 'ai' | 'human' | 'hybrid';
}

export interface SendMessageDto {
  content: string;
  senderType: 'lead' | 'ai' | 'human';
  isAI?: boolean;
  metadata?: any;
}

export interface UpdateConversationDto {
  assignedType?: 'ai' | 'human' | 'hybrid';
  status?: 'active' | 'paused' | 'closed';
  assignedTo?: string | null;
}

export const conversationsApi = {
  getAll: (params?: { status?: string; assignedTo?: string; leadId?: string }) =>
    api.get<{ conversations: Conversation[] }>('/conversations', { params }),
  
  getById: (id: string) =>
    api.get<{ conversation: Conversation }>(`/conversations/${id}`),
  
  create: (data: CreateConversationDto) =>
    api.post<{ conversation: Conversation }>('/conversations', data),
  
  sendMessage: (id: string, data: SendMessageDto) =>
    api.post<{ message: Message; aiResponse?: Message | null }>(`/conversations/${id}/messages`, data),
  
  update: (id: string, data: UpdateConversationDto) =>
    api.patch<{ conversation: Conversation }>(`/conversations/${id}`, data),
};
