import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Lead, LeadStatus, LegalArea, Message, FollowUp } from '@/types/lead';
import { mockLeads } from '@/data/mockLeads';
import { leadsApi, LeadApi } from '@/api/leads';

interface LeadsContextType {
  leads: Lead[];
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  isLoading: boolean;
  error: string | null;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  addMessage: (leadId: string, message: Omit<Message, 'id'>) => void;
  addFollowUp: (leadId: string, followUp: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (leadId: string, followUpId: string, updates: Partial<FollowUp>) => void;
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getLeadsByArea: (area: LegalArea) => Lead[];
  exportLeads: (format: 'csv' | 'json') => string;
  refreshLeads: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Converter LeadApi para Lead
  const convertApiLeadToLead = (apiLead: LeadApi): Lead => {
    return {
      id: apiLead.id,
      name: apiLead.name,
      phone: apiLead.phone,
      city: apiLead.city || undefined,
      state: apiLead.state || undefined,
      legalArea: (apiLead.legalArea as LegalArea) || undefined,
      demandDescription: apiLead.demandDescription || undefined,
      urgency: (apiLead.urgency as 'alta' | 'media' | 'baixa') || undefined,
      status: apiLead.status as LeadStatus,
      contactPreference: apiLead.contactPreference || undefined,
      availableForHumanContact: apiLead.availableForHumanContact,
      lgpdConsent: apiLead.lgpdConsent,
      lgpdConsentDate: apiLead.lgpdConsentDate ? new Date(apiLead.lgpdConsentDate) : undefined,
      messages: [], // Mensagens serão carregadas separadamente se necessário
      followUps: [], // Follow-ups serão carregados separadamente se necessário
      createdAt: new Date(apiLead.createdAt),
      updatedAt: new Date(apiLead.updatedAt),
    };
  };

  // Buscar leads do backend
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await leadsApi.getAll();
        const convertedLeads = response.data.leads.map(convertApiLeadToLead);
        setLeads(convertedLeads);
      } catch (err: any) {
        console.error('Erro ao buscar leads:', err);
        // Se der erro (ex: 401, 404), usa mocks como fallback
        setLeads(mockLeads);
        setError(err.response?.data?.message || 'Erro ao carregar leads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setLeads(prev => [newLead, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id 
        ? { ...lead, ...updates, updatedAt: new Date() }
        : lead
    ));
    if (selectedLead?.id === id) {
      setSelectedLead(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  }, [selectedLead]);

  const addMessage = useCallback((leadId: string, message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
    };
    setLeads(prev => prev.map(lead =>
      lead.id === leadId
        ? { 
            ...lead, 
            messages: [...lead.messages, newMessage],
            updatedAt: new Date(),
          }
        : lead
    ));
  }, []);

  const addFollowUp = useCallback((leadId: string, followUp: Omit<FollowUp, 'id'>) => {
    const newFollowUp: FollowUp = {
      ...followUp,
      id: crypto.randomUUID(),
    };
    setLeads(prev => prev.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            followUps: [...lead.followUps, newFollowUp],
            updatedAt: new Date(),
          }
        : lead
    ));
  }, []);

  const updateFollowUp = useCallback((leadId: string, followUpId: string, updates: Partial<FollowUp>) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            followUps: lead.followUps.map(f =>
              f.id === followUpId ? { ...f, ...updates } : f
            ),
            updatedAt: new Date(),
          }
        : lead
    ));
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

  const refreshLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await leadsApi.getAll();
      const convertedLeads = response.data.leads.map(convertApiLeadToLead);
      setLeads(convertedLeads);
    } catch (err: any) {
      console.error('Erro ao atualizar leads:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar leads');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LeadsContext.Provider value={{
      leads,
      selectedLead,
      setSelectedLead,
      isLoading,
      error,
      addLead,
      updateLead,
      addMessage,
      addFollowUp,
      updateFollowUp,
      getLeadsByStatus,
      getLeadsByArea,
      exportLeads,
      refreshLeads,
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
