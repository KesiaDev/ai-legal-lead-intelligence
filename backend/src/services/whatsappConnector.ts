/**
 * Conector WhatsApp Genérico
 * Interface unificada para envio de mensagens via WhatsApp
 * Compatível com múltiplas APIs: Evolution API, Twilio, WhatsApp Business API, etc.
 */

interface WhatsAppMessage {
  to: string; // Telefone no formato +5511999999999
  message: string;
  clienteId?: string; // ID do cliente/escritório
  templateId?: string; // ID do template (se aplicável)
  mediaUrl?: string; // URL de mídia (imagem, vídeo, etc.)
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia mensagem via WhatsApp
 * Esta é uma função genérica que pode ser adaptada para diferentes provedores
 * 
 * @param config - Configuração do WhatsApp (API URL, token, etc.)
 * @param message - Dados da mensagem
 * @returns Resposta do envio
 */
export async function sendWhatsAppMessage(
  config: {
    apiUrl: string;
    apiKey: string;
    instanceName?: string; // Para Evolution API
  },
  message: WhatsAppMessage
): Promise<WhatsAppResponse> {
  try {
    // Normaliza telefone (remove + se necessário, dependendo da API)
    const phone = message.to.replace(/^\+/, '');

    // Monta payload baseado no tipo de API
    // Por padrão, usa formato Evolution API (mais comum)
    const payload: any = {
      number: phone,
      text: message.message,
    };

    // Adiciona mídia se fornecida
    if (message.mediaUrl) {
      payload.mediaUrl = message.mediaUrl;
    }

    // Headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'apikey': config.apiKey,
    };

    // URL da API
    const instance = config.instanceName || 'default';
    const url = `${config.apiUrl}/message/sendText/${instance}`;

    // Faz requisição
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.key?.id || data.messageId || 'unknown',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Envia mensagem usando template (para WhatsApp Business API oficial)
 */
export async function sendWhatsAppTemplate(
  config: {
    apiUrl: string;
    apiKey: string;
    phoneNumberId: string; // Phone Number ID do WhatsApp Business
  },
  message: WhatsAppMessage & { templateId: string; templateParams?: string[] }
): Promise<WhatsAppResponse> {
  try {
    const phone = message.to.replace(/^\+/, '');

    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: message.templateId,
        language: { code: 'pt_BR' },
        components: message.templateParams
          ? [
              {
                type: 'body',
                parameters: message.templateParams.map((param) => ({
                  type: 'text',
                  text: param,
                })),
              },
            ]
          : undefined,
      },
    };

    const response = await fetch(
      `${config.apiUrl}/${config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WhatsApp Template API error: ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.messages?.[0]?.id || 'unknown',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Conector genérico que detecta automaticamente o tipo de API
 */
export async function sendWhatsApp(
  config: {
    provider: 'evolution' | 'twilio' | 'whatsapp-business' | 'generic';
    apiUrl: string;
    apiKey: string;
    instanceName?: string;
    phoneNumberId?: string;
  },
  message: WhatsAppMessage
): Promise<WhatsAppResponse> {
  switch (config.provider) {
    case 'evolution':
      return sendWhatsAppMessage(
        {
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          instanceName: config.instanceName,
        },
        message
      );

    case 'whatsapp-business':
      if (!message.templateId) {
        throw new Error('Template ID é obrigatório para WhatsApp Business API');
      }
      if (!config.phoneNumberId) {
        throw new Error('Phone Number ID é obrigatório para WhatsApp Business API');
      }
      return sendWhatsAppTemplate(
        {
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          phoneNumberId: config.phoneNumberId,
        },
        message as WhatsAppMessage & { templateId: string }
      );

    case 'twilio':
    case 'generic':
    default:
      // Usa formato genérico
      return sendWhatsAppMessage(
        {
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
        },
        message
      );
  }
}
