import api from './client';

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  description?: string;
  isActive: boolean;
}

export const pipelineApi = {
  getStages: () =>
    api.get<{ stages: PipelineStage[] }>('/pipeline/stages'),
};
