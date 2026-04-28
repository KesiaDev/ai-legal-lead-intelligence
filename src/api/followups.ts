import api from './client';

export interface FollowUpItem {
  id: string;
  leadId: string;
  lead: {
    name: string;
    phone: string;
    email?: string;
  };
  type: string;
  status: string; // pending | sent | failed | cancelled
  scheduledAt: string;
  sentAt?: string;
  content?: string;
  notes?: string;
  createdBy: string;
}

export interface FollowUpStats {
  pending: number;
  sent: number;
  failed: number;
}

export const followupsApi = {
  async list(params?: { status?: string; limit?: number }): Promise<FollowUpItem[]> {
    const res = await api.get('/api/followups', { params });
    return res.data?.followUps || res.data?.data || res.data || [];
  },

  async stats(): Promise<FollowUpStats> {
    try {
      const res = await api.get('/api/followups/stats');
      return res.data;
    } catch {
      return { pending: 0, sent: 0, failed: 0 };
    }
  },

  // Backend usa DELETE /api/followups/:id (cancel)
  async cancel(id: string): Promise<void> {
    await api.delete(`/api/followups/${id}`);
  },

  // Backend usa POST /api/followups/bulk-cancel
  async cancelAll(): Promise<void> {
    await api.post('/api/followups/bulk-cancel', {});
  },
};
