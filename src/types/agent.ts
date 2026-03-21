// Agent configuration types

import { AIConfig } from './ai';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  aiConfig: AIConfig;
}

export interface BusinessHours {
  day: 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB' | 'DOM';
  isOpen: boolean;
  startTime: string;
  endTime: string;
  is24h?: boolean;
}

export interface CommunicationConfig {
  bufferLatency: number; // seconds
  timeBetweenMessages: number; // seconds
  errorMessage: string;
  tone: 'formal' | 'casual' | 'professional';
  useEmojis: boolean;
  signature: string;
}

export interface AgentPrompt {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'ativo' | 'inativo';
  provider: 'OpenAI' | 'Google';
  model: string;
  content: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface FollowUpConfig {
  businessHours: BusinessHours[];
  cadence: {
    firstFollowUp: number; // hours
    secondFollowUp: number;
    finalFollowUp: number;
  };
  messages: {
    first: string;
    second: string;
    final: string;
  };
}

export interface ScheduleConfig {
  timezone: string;
  meetingDuration: number; // minutes
  timeIncrement: number; // minutes
  minAdvanceTime: number; // minutes
  maxAdvanceDays: number;
  onlyQualifiedLeads: boolean;
  availableHours: BusinessHours[];
}

export interface Intention {
  id: string;
  name: string;
  description?: string;
  actions: string[];
}

export type AgentSection = 
  | 'config' 
  | 'communication'
  | 'humanization'
  | 'voice'
  | 'prompts' 
  | 'templates'
  | 'knowledge' 
  | 'followup' 
  | 'schedule' 
  | 'intentions'
  | 'triggers';
