export const PLANS = {
  free: {
    maxLeads: 50,
    maxUsers: 1,
    aiAgentEnabled: false,
    exportsEnabled: false,
    label: 'Gratuito',
  },
  pro: {
    maxLeads: 2000,
    maxUsers: 5,
    aiAgentEnabled: true,
    exportsEnabled: true,
    label: 'Pro',
  },
  enterprise: {
    maxLeads: Infinity,
    maxUsers: Infinity,
    aiAgentEnabled: true,
    exportsEnabled: true,
    label: 'Enterprise',
  },
} as const;

export type PlanName = keyof typeof PLANS;
