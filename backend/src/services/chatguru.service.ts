/**
 * ChatGuru WhatsApp Integration
 * API: https://chatguru.com.br/api
 */
export class ChatGuruService {
  private apiKey: string;
  private channelId: string;

  constructor(apiKey: string, channelId: string) {
    this.apiKey = apiKey;
    this.channelId = channelId;
  }

  private headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(to: string, text: string) {
    const response = await fetch(`https://api.chatguru.com.br/v1/channels/${this.channelId}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        to,
        type: 'text',
        text: { body: text },
      }),
    });
    return response.json();
  }

  async sendAudio(to: string, audioUrl: string) {
    const response = await fetch(`https://api.chatguru.com.br/v1/channels/${this.channelId}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        to,
        type: 'audio',
        audio: { link: audioUrl },
      }),
    });
    return response.json();
  }

  async sendDocument(to: string, documentUrl: string, filename: string) {
    const response = await fetch(`https://api.chatguru.com.br/v1/channels/${this.channelId}/messages`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        to,
        type: 'document',
        document: { link: documentUrl, filename },
      }),
    });
    return response.json();
  }

  async sendTyping(to: string, durationMs: number) {
    // Simula digitação antes de enviar mensagem
    const response = await fetch(`https://api.chatguru.com.br/v1/channels/${this.channelId}/typing`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ to, duration: durationMs }),
    });
    return response.json();
  }

  async setWebhook(url: string, events: string[]) {
    const response = await fetch(`https://api.chatguru.com.br/v1/channels/${this.channelId}/webhook`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ url, events }),
    });
    return response.json();
  }
}
