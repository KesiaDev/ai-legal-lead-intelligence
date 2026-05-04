/**
 * EvolutionProvisioningService — Provisiona instâncias WhatsApp automaticamente
 *
 * Quando um cliente se cadastra no SDR Jurídico:
 *  1. Cria instância no Evolution GO com nome único (sdr-{tenantId-slice})
 *  2. Salva credenciais no IntegrationConfig do tenant
 *  3. Retorna QR code para o cliente escanear e conectar o WhatsApp
 *
 * Quando o tenant é cancelado:
 *  - Deleta a instância do Evolution GO
 */

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || '';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

async function evoRequest(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${EVOLUTION_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: EVOLUTION_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Evolution API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

export const EvolutionProvisioningService = {
  // ── Gera nome único de instância para o tenant ───────────────────────────
  instanceName(tenantId: string): string {
    return `sdr-${tenantId.replace(/-/g, '').slice(0, 12)}`;
  },

  // ── Cria instância nova no Evolution GO ──────────────────────────────────
  async createInstance(tenantId: string): Promise<{
    instanceName: string;
    qrCode: string | null;
  }> {
    const name = this.instanceName(tenantId);

    const data = await evoRequest('POST', '/instance/create', {
      instanceName: name,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    });

    const qrCode = data?.qrcode?.base64 || data?.qrcode || null;

    return { instanceName: name, qrCode };
  },

  // ── Busca QR code de uma instância existente ─────────────────────────────
  async getQrCode(instanceName: string): Promise<string | null> {
    try {
      const data = await evoRequest('GET', `/instance/connect/${instanceName}`);
      return data?.base64 || data?.qrcode?.base64 || null;
    } catch {
      return null;
    }
  },

  // ── Status da conexão ────────────────────────────────────────────────────
  async getStatus(instanceName: string): Promise<'open' | 'connecting' | 'close' | 'unknown'> {
    try {
      const data = await evoRequest('GET', `/instance/fetchInstances?instanceName=${instanceName}`);
      const instance = Array.isArray(data) ? data[0] : data;
      return instance?.instance?.state || 'unknown';
    } catch {
      return 'unknown';
    }
  },

  // ── Deleta instância (ao cancelar tenant) ────────────────────────────────
  async deleteInstance(instanceName: string): Promise<void> {
    try {
      await evoRequest('DELETE', `/instance/delete/${instanceName}`);
    } catch (err: any) {
      console.warn(`Erro ao deletar instância ${instanceName}: ${err.message}`);
    }
  },

  // ── Lista todas as instâncias ────────────────────────────────────────────
  async listInstances(): Promise<Array<{ name: string; state: string }>> {
    try {
      const data = await evoRequest('GET', '/instance/fetchInstances');
      const list = Array.isArray(data) ? data : [];
      return list.map((i: any) => ({
        name: i.instance?.instanceName || i.instanceName || '',
        state: i.instance?.state || 'unknown',
      }));
    } catch {
      return [];
    }
  },
};
