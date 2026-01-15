import { useEffect, useRef, useState, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export interface WebSocketMessage {
  type: 'connected' | 'new_message' | 'conversation_updated' | 'typing' | 'heartbeat' | 'pong' | 'error';
  message?: any;
  conversation?: any;
  userId?: string;
  isTyping?: boolean;
  error?: string;
  timestamp?: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => boolean;
  sendTyping: (isTyping: boolean) => boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(conversationId: string | null): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!conversationId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const wsUrl = `${WS_URL}/ws/${conversationId}${token ? `?token=${token}` : ''}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        console.log(`[WS] Connected to conversation ${conversationId}`);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Ignorar heartbeat
          if (message.type === 'heartbeat' || message.type === 'pong') {
            return;
          }

          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log(`[WS] Connection closed: ${event.code} ${event.reason}`);
        
        // Tentar reconectar apenas se não foi fechado intencionalmente
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[WS] Reconnecting... (attempt ${reconnectAttempts.current})`);
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WS] Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  }, [conversationId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    return sendMessage({
      type: 'typing',
      isTyping,
    });
  }, [sendMessage]);

  useEffect(() => {
    if (conversationId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendTyping,
    connect,
    disconnect,
  };
}
