import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Lead, LeadStatus, LegalArea, Message, FollowUp } from '@/types/lead';
import { useLeads as useLeadsApi, useLead as useLeadApi } from '@/hooks/useLeads';
import { CreateLeadDto, UpdateLeadDto } from '@/api/leads';

interface LeadsContextType {
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  addMessage: (leadId: string, message: Omit<Message, 'id'>) => void;
  addFollowUp: (leadId: string, followUp: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (leadId: string, followUpId: string, updates: Partial<FollowUp>) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadsByArea: (area: LegalArea) => Lead[];
  exportLeads: (format: 'csv' | 'json') => string;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  // Usar API real
  const { leads: apiLeads, createLead: createLeadApi, updateLead: updateLeadApi, isLoading, error } = useLeadsApi();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Manter compatibilidade: usar dados da API
  const leads = apiLeads || [];
  
  // Se houver erro, ainda retornamos array vazio para não quebrar componentes
  // Componentes individuais devem tratar o erro

  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const createDto: CreateLeadDto = {
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      city: leadData.city,
      state: leadData.state,
      legalArea: leadData.legalArea,
      demandDescription: leadData.demandDescription,
      urgency: leadData.urgency,
      contactPreference: leadData.contactPreference,
      availableForHumanContact: leadData.availableForHumanContact,
      lgpdConsent: leadData.lgpdConsent,
      tags: [],
    };
    
    await createLeadApi(createDto);
  }, [createLeadApi]);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    const updateDto: UpdateLeadDto = {
      name: updates.name,
      phone: updates.phone,
      email: updates.email,
      city: updates.city,
      state: updates.state,
      legalArea: updates.legalArea,
      demandDescription: updates.demandDescription,
      urgency: updates.urgency,
      status: updates.status as any,
      contactPreference: updates.contactPreference,
      availableForHumanContact: updates.availableForHumanContact,
    };
    
    await updateLeadApi({ id, data: updateDto });
    
    if (selectedLead?.id === id) {
      // Atualizar lead selecionado localmente (será atualizado pelo refetch)
      setSelectedLead(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedLead, updateLeadApi]);

  // TODO: Implementar quando API de mensagens estiver completa
  const addMessage = useCallback((leadId: string, message: Omit<Message, 'id'>) => {
    console.warn('addMessage: Implementar via API de conversas');
    // Será implementado via conversationsApi.sendMessage
  }, []);

  // TODO: Implementar quando API de follow-ups estiver completa
  const addFollowUp = useCallback((leadId: string, followUp: Omit<FollowUp, 'id'>) => {
    console.warn('addFollowUp: Implementar via API');
    // Será implementado em próxima fase
  }, []);

  const updateFollowUp = useCallback((leadId: string, followUpId: string, updates: Partial<FollowUp>) => {
    console.warn('updateFollowUp: Implementar via API');
    // Será implementado em próxima fase
  }, []);

  const getLeadsByStatus = useCallback((status: LeadStatus) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  const getLeadsByArea = useCallback((area: LegalArea) => {
    return leads.filter(lead => lead.legalArea === area);
  }, [leads]);

  const exportLeads = useCallback((format: 'csv' | 'json'): string => {
    const exportData = leads.map(lead => ({
      nome: lead.name,
      telefone: lead.phone,
      cidade: lead.city || '',
      estado: lead.state || '',
      area_direito: lead.legalArea || '',
      demanda: lead.demandDescription || '',
      urgencia: lead.urgency || '',
      status: lead.status,
      consentimento_lgpd: lead.lgpdConsent ? 'Sim' : 'Não',
      data_consentimento: lead.lgpdConsentDate?.toISOString() || '',
      criado_em: lead.createdAt.toISOString(),
      atualizado_em: lead.updatedAt.toISOString(),
    }));

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    // CSV format
    const headers = Object.keys(exportData[0] || {}).join(',');
    const rows = exportData.map(row => 
      Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    return [headers, ...rows].join('\n');
  }, [leads]);

  return (
    <LeadsContext.Provider value={{
      leads,
      selectedLead,
      setSelectedLead,
      addLead,
      updateLead,
      addMessage,
      addFollowUp,
      updateFollowUp,
      getLeadsByStatus,
      getLeadsByArea,
      exportLeads,
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
}
