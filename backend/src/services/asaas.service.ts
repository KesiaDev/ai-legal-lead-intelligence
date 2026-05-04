/**
 * AsaasService — Integração com Asaas para cobrança recorrente
 *
 * Fluxo:
 *  1. createCustomer()     → cria cliente no Asaas
 *  2. createSubscription() → cria assinatura mensal
 *  3. getPaymentLink()     → retorna link de pagamento (Pix/boleto/cartão)
 *
 * Webhook:
 *  PAYMENT_CONFIRMED → ativa tenant
 *  PAYMENT_OVERDUE   → suspende tenant (após 3 dias)
 *  SUBSCRIPTION_CANCELLED → cancela tenant
 */

const ASAAS_BASE = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/api/v3';

const ASAAS_KEY = process.env.ASAAS_API_KEY || '';

async function asaasRequest(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${ASAAS_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data as any)?.errors?.[0]?.description || `Asaas ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  externalReference?: string; // tenantId
}

export interface AsaasSubscriptionInput {
  customerId: string;
  plan: 'essencial' | 'escritorio' | 'corporativo';
  externalReference?: string; // tenantId
}

const PLAN_VALUES: Record<string, number> = {
  essencial:   1990,
  escritorio:  2490,
  corporativo: 2990,
};

export const AsaasService = {
  // ── Criar cliente ────────────────────────────────────────────────────────
  async createCustomer(input: AsaasCustomerInput): Promise<{ id: string }> {
    const data = await asaasRequest('POST', '/customers', {
      name: input.name,
      email: input.email,
      ...(input.cpfCnpj && { cpfCnpj: input.cpfCnpj.replace(/\D/g, '') }),
      ...(input.phone && { phone: input.phone.replace(/\D/g, '') }),
      ...(input.externalReference && { externalReference: input.externalReference }),
    });
    return { id: data.id };
  },

  // ── Criar assinatura mensal ──────────────────────────────────────────────
  async createSubscription(input: AsaasSubscriptionInput): Promise<{
    id: string;
    paymentLink: string | null;
  }> {
    const value = PLAN_VALUES[input.plan] ?? 1990;
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 3); // 3 dias de carência

    const data = await asaasRequest('POST', '/subscriptions', {
      customer: input.customerId,
      billingType: 'UNDEFINED', // aceita Pix, boleto ou cartão
      cycle: 'MONTHLY',
      value,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      description: `SDR Jurídico IA — Plano ${input.plan}`,
      ...(input.externalReference && { externalReference: input.externalReference }),
    });

    return {
      id: data.id,
      paymentLink: data.paymentLink || null,
    };
  },

  // ── Buscar link de pagamento da próxima cobrança ─────────────────────────
  async getPaymentLink(subscriptionId: string): Promise<string | null> {
    try {
      const data = await asaasRequest('GET', `/subscriptions/${subscriptionId}/payments`);
      const payments: any[] = data?.data || [];
      const pending = payments.find((p: any) => p.status === 'PENDING');
      return pending?.invoiceUrl || pending?.bankSlipUrl || null;
    } catch {
      return null;
    }
  },

  // ── Cancelar assinatura ──────────────────────────────────────────────────
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await asaasRequest('DELETE', `/subscriptions/${subscriptionId}`);
  },

  // ── Buscar cliente por externalReference (tenantId) ──────────────────────
  async findCustomerByReference(tenantId: string): Promise<string | null> {
    try {
      const data = await asaasRequest('GET', `/customers?externalReference=${tenantId}&limit=1`);
      return data?.data?.[0]?.id || null;
    } catch {
      return null;
    }
  },
};
