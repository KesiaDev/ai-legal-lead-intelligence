/**
 * Tipos relacionados à IA Controlada
 */

export interface AIConfig {
  enabled: boolean;
  interventionLevel: 'baixo' | 'medio';
}

export interface AISuggestion {
  id: string;
  type: 'rewrite' | 'analysis' | 'question';
  originalContent?: string;
  suggestedContent: string;
  reasoning?: string;
  confidence?: number;
  accepted?: boolean;
}

export interface AIAnalysisDisplay {
  legalArea: {
    name: string;
    confidence: number;
  };
  urgency: 'alta' | 'media' | 'baixa';
  summary: string;
  suggestions: string[];
}
