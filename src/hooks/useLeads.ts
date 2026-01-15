import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, CreateLeadDto, UpdateLeadDto } from '@/api/leads';
import { Lead } from '@/types/lead';

export function useLeads(params?: { status?: string; search?: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.getAll(params).then(res => res.data.leads),
    retry: false, // Não tentar novamente automaticamente
  });

  const createLead = useMutation({
    mutationFn: (data: CreateLeadDto) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) =>
      leadsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteLead = useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const transitionLead = useMutation({
    mutationFn: ({ id, toStage, reason, notes }: {
      id: string;
      toStage: string;
      reason?: string;
      notes?: string;
    }) => leadsApi.transition(id, toStage, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    leads: data || [],
    isLoading,
    error,
    createLead: createLead.mutateAsync,
    updateLead: updateLead.mutateAsync,
    deleteLead: deleteLead.mutateAsync,
    transitionLead: transitionLead.mutateAsync,
  };
}

export function useLead(id: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id!).then(res => res.data.lead),
    enabled: !!id,
    retry: false, // Não tentar novamente automaticamente
  });

  return {
    lead: data,
    isLoading,
    error,
  };
}
