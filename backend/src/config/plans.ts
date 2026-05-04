export const PLANS = {
  // Plano legado — não exposto no checkout, mantido para compatibilidade
  free: {
    label: 'Gratuito',
    maxLeads: 50,
    maxUsers: 1,
    maxAgents: 1,
    aiAgentEnabled: false,
    exportsEnabled: false,
    voiceEnabled: false,
    crmEnabled: false,
    calendarEnabled: false,
    reportsEnabled: false,
    pricePerLead: 0,
    monthlyLeadsIncluded: 50,
    monthlyPrice: 0,
  },

  // Advogado Solo — R$ 1,99/lead | R$ 1.990/mês (1.000 leads)
  essencial: {
    label: 'Advogado Solo',
    maxLeads: Infinity,
    maxUsers: 2,
    maxAgents: 1,
    aiAgentEnabled: true,
    exportsEnabled: false,
    voiceEnabled: false,
    crmEnabled: false,
    calendarEnabled: false,
    reportsEnabled: false,
    pricePerLead: 1.99,
    monthlyLeadsIncluded: 1000,
    monthlyPrice: 1990,
  },

  // Para Escritórios — R$ 2,49/lead | R$ 2.490/mês (1.000 leads)
  escritorio: {
    label: 'Para Escritórios',
    maxLeads: Infinity,
    maxUsers: 5,
    maxAgents: 3,
    aiAgentEnabled: true,
    exportsEnabled: true,
    voiceEnabled: true,
    crmEnabled: true,
    calendarEnabled: true,
    reportsEnabled: true,
    pricePerLead: 2.49,
    monthlyLeadsIncluded: 1000,
    monthlyPrice: 2490,
  },

  // Corporativo / Alto Volume — R$ 2,99/lead | R$ 2.990/mês (1.000 leads)
  corporativo: {
    label: 'Alto Volume',
    maxLeads: Infinity,
    maxUsers: Infinity,
    maxAgents: Infinity,
    aiAgentEnabled: true,
    exportsEnabled: true,
    voiceEnabled: true,
    crmEnabled: true,
    calendarEnabled: true,
    reportsEnabled: true,
    pricePerLead: 2.99,
    monthlyLeadsIncluded: 1000,
    monthlyPrice: 2990,
  },

  // Alias legados
  pro: {
    label: 'Pro',
    maxLeads: Infinity,
    maxUsers: 5,
    maxAgents: 3,
    aiAgentEnabled: true,
    exportsEnabled: true,
    voiceEnabled: false,
    crmEnabled: false,
    calendarEnabled: false,
    reportsEnabled: false,
    pricePerLead: 2.49,
    monthlyLeadsIncluded: 1000,
    monthlyPrice: 2490,
  },

  enterprise: {
    label: 'Enterprise',
    maxLeads: Infinity,
    maxUsers: Infinity,
    maxAgents: Infinity,
    aiAgentEnabled: true,
    exportsEnabled: true,
    voiceEnabled: true,
    crmEnabled: true,
    calendarEnabled: true,
    reportsEnabled: true,
    pricePerLead: 2.99,
    monthlyLeadsIncluded: 1000,
    monthlyPrice: 2990,
  },
} as const;

export type PlanName = keyof typeof PLANS;

export const PLAN_FEATURES: Record<string, { name: string; price: number; pricePerLead: number }> = {
  essencial:   { name: 'Advogado Solo',    price: 1990, pricePerLead: 1.99 },
  escritorio:  { name: 'Para Escritórios', price: 2490, pricePerLead: 2.49 },
  corporativo: { name: 'Alto Volume',      price: 2990, pricePerLead: 2.99 },
};
