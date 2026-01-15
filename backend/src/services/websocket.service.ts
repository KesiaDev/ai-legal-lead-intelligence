import { FastifyInstance } from 'fastify';
import { SocketStream } from '@fastify/websocket';

interface WebSocketConnection {
  socket: WebSocket;
  conversationId: string;
  userId?: string;
  tenantId?: string;
  connectedAt: Date;
}

class WebSocketManager {
  private connections: Map<string, Set<WebSocketConnection>> = new Map();
  private fastifyInstance: FastifyInstance | null = null;

  setFastifyInstance(instance: FastifyInstance) {
    this.fastifyInstance = instance;
  }

  /**
   * Adiciona uma conexão WebSocket
   */
  addConnection(conversationId: string, connection: WebSocketConnection) {
    if (!this.connections.has(conversationId)) {
      this.connections.set(conversationId, new Set());
    }
    this.connections.get(conversationId)!.add(connection);

    console.log(`[WS] Connection added to conversation ${conversationId}. Total: ${this.getConnectionCount(conversationId)}`);

    // Enviar confirmação de conexão
    connection.socket.send(JSON.stringify({
      type: 'connected',
      conversationId,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Remove uma conexão WebSocket
   */
  removeConnection(conversationId: string, socket: WebSocket) {
    const connections = this.connections.get(conversationId);
    if (connections) {
      for (const conn of connections) {
        if (conn.socket === socket) {
          connections.delete(conn);
          break;
        }
      }
      if (connections.size === 0) {
        this.connections.delete(conversationId);
      }
    }
    console.log(`[WS] Connection removed from conversation ${conversationId}. Total: ${this.getConnectionCount(conversationId)}`);
  }

  /**
   * Faz broadcast de mensagem para todas as conexões de uma conversa
   */
  broadcastToConversation(conversationId: string, message: any) {
    const connections = this.connections.get(conversationId);
    if (!connections) {
      return;
    }

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const conn of connections) {
      if (conn.socket.readyState === WebSocket.OPEN) {
        try {
          conn.socket.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`[WS] Error sending message to connection:`, error);
        }
      }
    }

    console.log(`[WS] Broadcast to conversation ${conversationId}: ${sentCount}/${connections.size} connections`);
  }

  /**
   * Faz broadcast para todas as conversas de um tenant (notificações)
   */
  broadcastToTenant(tenantId: string, message: any) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const [conversationId, connections] of this.connections.entries()) {
      for (const conn of connections) {
        if (conn.tenantId === tenantId && conn.socket.readyState === WebSocket.OPEN) {
          try {
            conn.socket.send(messageStr);
            sentCount++;
          } catch (error) {
            console.error(`[WS] Error sending tenant broadcast:`, error);
          }
        }
      }
    }

    console.log(`[WS] Tenant broadcast: ${sentCount} connections notified`);
  }

  /**
   * Obtém número de conexões de uma conversa
   */
  getConnectionCount(conversationId: string): number {
    return this.connections.get(conversationId)?.size || 0;
  }

  /**
   * Obtém todas as conexões ativas
   */
  getActiveConnections(): number {
    let total = 0;
    for (const connections of this.connections.values()) {
      total += connections.size;
    }
    return total;
  }

  /**
   * Limpa conexões fechadas
   */
  cleanup() {
    for (const [conversationId, connections] of this.connections.entries()) {
      for (const conn of connections) {
        if (conn.socket.readyState === WebSocket.CLOSED || conn.socket.readyState === WebSocket.CLOSING) {
          connections.delete(conn);
        }
      }
      if (connections.size === 0) {
        this.connections.delete(conversationId);
      }
    }
  }
}

// Singleton
export const wsManager = new WebSocketManager();

/**
 * Inicializa conexão WebSocket com autenticação
 */
export async function initializeWebSocket(
  connection: SocketStream,
  req: any,
  fastify: FastifyInstance
) {
  const { conversationId } = req.params as { conversationId: string };
  const token = req.query?.token as string;

  // Verificar autenticação
  let userId: string | undefined;
  let tenantId: string | undefined;

  if (token) {
    try {
      const decoded = fastify.jwt.verify(token) as any;
      userId = decoded.id;
      tenantId = decoded.tenantId;
    } catch (error) {
      connection.socket.close(1008, 'Invalid token');
      return;
    }
  }

  const wsConnection: WebSocketConnection = {
    socket: connection.socket as any,
    conversationId,
    userId,
    tenantId,
    connectedAt: new Date(),
  };

  // Adicionar conexão
  wsManager.addConnection(conversationId, wsConnection);

  // Handler de mensagens
  connection.socket.on('message', (message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Processar diferentes tipos de mensagens
      switch (data.type) {
        case 'ping':
          connection.socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          break;
        case 'typing':
          // Broadcast indicador de "digitando..."
          wsManager.broadcastToConversation(conversationId, {
            type: 'typing',
            userId,
            isTyping: data.isTyping,
          });
          break;
        default:
          console.log(`[WS] Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
      connection.socket.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format',
      }));
    }
  });

  // Handler de fechamento
  connection.socket.on('close', () => {
    wsManager.removeConnection(conversationId, connection.socket as any);
  });

  // Handler de erro
  connection.socket.on('error', (error: Error) => {
    console.error(`[WS] Error on connection ${conversationId}:`, error);
    wsManager.removeConnection(conversationId, connection.socket as any);
  });

  // Heartbeat para manter conexão viva
  const heartbeatInterval = setInterval(() => {
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify({ type: 'heartbeat' }));
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000); // A cada 30s

  // Limpar intervalo quando conexão fechar
  connection.socket.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}
