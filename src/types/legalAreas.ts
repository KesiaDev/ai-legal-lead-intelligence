/**
 * ÁREAS DO DIREITO BRASILEIRO - LISTA COMPLETA
 * 
 * Estrutura hierárquica organizada por categorias principais
 * Suporta área principal + especialização customizada
 */

// Categorias principais
export type LegalAreaCategory = 
  | 'publico'
  | 'penal'
  | 'civil'
  | 'familia'
  | 'trabalhista'
  | 'empresarial'
  | 'consumidor'
  | 'humanos'
  | 'internacional'
  | 'digital'
  | 'especializado';

// Áreas específicas dentro de cada categoria
export type LegalArea =
  // Direito Público
  | 'constitucional'
  | 'administrativo'
  | 'tributario'
  | 'financeiro'
  | 'eleitoral'
  | 'ambiental'
  | 'urbanistico'
  | 'regulatorio'
  // Direito Penal
  | 'penal'
  | 'processual_penal'
  | 'penal_economico'
  | 'penal_empresarial'
  | 'execucao_penal'
  // Direito Civil
  | 'civil'
  | 'processual_civil'
  | 'responsabilidade_civil'
  | 'obrigacoes'
  | 'contratual'
  | 'coisas'
  // Direito de Família
  | 'familia'
  | 'sucessoes'
  // Direito Trabalhista
  | 'trabalhista'
  | 'processual_trabalhista'
  | 'previdenciario'
  | 'sindical'
  // Direito Empresarial
  | 'empresarial'
  | 'societario'
  | 'falimentar'
  | 'mercado_capitais'
  | 'economico'
  // Direito do Consumidor
  | 'consumidor'
  // Direitos Humanos
  | 'direitos_humanos'
  | 'coletivo'
  | 'acoes_coletivas'
  | 'terceiro_setor'
  // Direito Internacional
  | 'internacional_publico'
  | 'internacional_privado'
  // Direito Digital
  | 'digital'
  | 'lgpd'
  | 'tecnologia_informacao'
  | 'internet'
  | 'propriedade_intelectual'
  | 'autoral'
  | 'marcas_patentes'
  // Direito Especializado
  | 'agrario'
  | 'imobiliario'
  | 'notarial'
  | 'maritimo'
  | 'aeronautico'
  | 'aduaneiro'
  | 'desportivo'
  | 'medico'
  | 'educacional'
  | 'militar'
  | 'outra'; // Para especializações customizadas

// Mapeamento completo de áreas para labels
export const LEGAL_AREAS: Record<LegalArea, string> = {
  // Direito Público
  constitucional: 'Direito Constitucional',
  administrativo: 'Direito Administrativo',
  tributario: 'Direito Tributário',
  financeiro: 'Direito Financeiro',
  eleitoral: 'Direito Eleitoral',
  ambiental: 'Direito Ambiental',
  urbanistico: 'Direito Urbanístico',
  regulatorio: 'Direito Regulatório',
  
  // Direito Penal
  penal: 'Direito Penal',
  processual_penal: 'Direito Processual Penal',
  penal_economico: 'Direito Penal Econômico',
  penal_empresarial: 'Direito Penal Empresarial',
  execucao_penal: 'Execução Penal',
  
  // Direito Civil
  civil: 'Direito Civil',
  processual_civil: 'Direito Processual Civil',
  responsabilidade_civil: 'Responsabilidade Civil',
  obrigacoes: 'Direito das Obrigações',
  contratual: 'Direito Contratual',
  coisas: 'Direito das Coisas (Propriedade)',
  
  // Direito de Família
  familia: 'Direito de Família',
  sucessoes: 'Direito das Sucessões',
  
  // Direito Trabalhista
  trabalhista: 'Direito do Trabalho',
  processual_trabalhista: 'Direito Processual do Trabalho',
  previdenciario: 'Direito Previdenciário',
  sindical: 'Direito Sindical',
  
  // Direito Empresarial
  empresarial: 'Direito Empresarial',
  societario: 'Direito Societário',
  falimentar: 'Direito Falimentar e Recuperação Judicial',
  mercado_capitais: 'Direito do Mercado de Capitais',
  economico: 'Direito Econômico',
  
  // Direito do Consumidor
  consumidor: 'Direito do Consumidor',
  
  // Direitos Humanos
  direitos_humanos: 'Direitos Humanos',
  coletivo: 'Direito Coletivo',
  acoes_coletivas: 'Ações Coletivas',
  terceiro_setor: 'Direito do Terceiro Setor',
  
  // Direito Internacional
  internacional_publico: 'Direito Internacional Público',
  internacional_privado: 'Direito Internacional Privado',
  
  // Direito Digital
  digital: 'Direito Digital',
  lgpd: 'Proteção de Dados (LGPD)',
  tecnologia_informacao: 'Direito da Tecnologia da Informação',
  internet: 'Direito da Internet',
  propriedade_intelectual: 'Propriedade Intelectual',
  autoral: 'Direito Autoral',
  marcas_patentes: 'Direito de Marcas e Patentes',
  
  // Direito Especializado
  agrario: 'Direito Agrário',
  imobiliario: 'Direito Imobiliário',
  notarial: 'Direito Notarial e Registral',
  maritimo: 'Direito Marítimo',
  aeronautico: 'Direito Aeronáutico',
  aduaneiro: 'Direito Aduaneiro',
  desportivo: 'Direito Desportivo',
  medico: 'Direito Médico e da Saúde',
  educacional: 'Direito Educacional',
  militar: 'Direito Militar',
  
  // Outra (customizável)
  outra: 'Outra área / Especialização',
};

// Categorias principais para organização
export const LEGAL_AREA_CATEGORIES: Record<LegalAreaCategory, { label: string; areas: LegalArea[] }> = {
  publico: {
    label: 'Direito Público',
    areas: ['constitucional', 'administrativo', 'tributario', 'financeiro', 'eleitoral', 'ambiental', 'urbanistico', 'regulatorio'],
  },
  penal: {
    label: 'Direito Penal e Processual',
    areas: ['penal', 'processual_penal', 'penal_economico', 'penal_empresarial', 'execucao_penal'],
  },
  civil: {
    label: 'Direito Civil e Processual',
    areas: ['civil', 'processual_civil', 'responsabilidade_civil', 'obrigacoes', 'contratual', 'coisas'],
  },
  familia: {
    label: 'Direito de Família e Sucessões',
    areas: ['familia', 'sucessoes'],
  },
  trabalhista: {
    label: 'Direito do Trabalho e Previdenciário',
    areas: ['trabalhista', 'processual_trabalhista', 'previdenciario', 'sindical'],
  },
  empresarial: {
    label: 'Direito Empresarial e Econômico',
    areas: ['empresarial', 'societario', 'falimentar', 'mercado_capitais', 'economico'],
  },
  consumidor: {
    label: 'Direito do Consumidor',
    areas: ['consumidor'],
  },
  humanos: {
    label: 'Direitos Humanos e Coletivos',
    areas: ['direitos_humanos', 'coletivo', 'acoes_coletivas', 'terceiro_setor'],
  },
  internacional: {
    label: 'Direito Internacional',
    areas: ['internacional_publico', 'internacional_privado'],
  },
  digital: {
    label: 'Direito Digital e Inovação',
    areas: ['digital', 'lgpd', 'tecnologia_informacao', 'internet', 'propriedade_intelectual', 'autoral', 'marcas_patentes'],
  },
  especializado: {
    label: 'Direito Agrário e Especializado',
    areas: ['agrario', 'imobiliario', 'notarial', 'maritimo', 'aeronautico', 'aduaneiro', 'desportivo', 'medico', 'educacional', 'militar'],
  },
};

// Função helper para obter categoria de uma área
export function getLegalAreaCategory(area: LegalArea): LegalAreaCategory {
  for (const [category, data] of Object.entries(LEGAL_AREA_CATEGORIES)) {
    if (data.areas.includes(area)) {
      return category as LegalAreaCategory;
    }
  }
  return 'especializado';
}

// Função helper para obter todas as áreas em formato de opções para selects
export function getLegalAreasAsOptions() {
  return Object.entries(LEGAL_AREAS).map(([value, label]) => ({
    value: value as LegalArea,
    label,
  }));
}

// Função helper para obter áreas agrupadas por categoria
export function getLegalAreasGrouped() {
  return Object.entries(LEGAL_AREA_CATEGORIES).map(([category, data]) => ({
    category: category as LegalAreaCategory,
    label: data.label,
    areas: data.areas.map(area => ({
      value: area,
      label: LEGAL_AREAS[area],
    })),
  }));
}
