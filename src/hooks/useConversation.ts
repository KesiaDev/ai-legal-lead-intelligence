import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi, SendMessageDto, UpdateConversationDto } from '@/api/conversations';
import { Conversation, Message } from '@/api/conversations';

export function useConversation(id: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationsApi.getById(id!).then(res => res.data.conversation),
    enabled: !!id,
    refetchInterval: false, // WebSocket vai atualizar em tempo real, polling apenas como fallback
    retry: false, // Não tentar novamente automaticamente
  });

  const sendMessage = useMutation({
    mutationFn: (data: SendMessageDto) =>
      conversationsApi.sendMessage(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
    },
  });

  const updateConversation = useMutation({
    mutationFn: (data: UpdateConversationDto) =>
      conversationsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
    },
  });

  return {
    conversation: data,
    messages: data?.messages || [],
    isLoading,
    error,
    sendMessage: sendMessage.mutateAsync,
    updateConversation: updateConversation.mutateAsync,
  };
}

export function useConversations(params?: { status?: string; assignedTo?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationsApi.getAll(params).then(res => res.data.conversations),
    refetchInterval: 10000, // Polling a cada 10s
    retry: false, // Não tentar novamente automaticamente
  });

  return {
    conversations: data || [],
    isLoading,
    error,
  };
}
