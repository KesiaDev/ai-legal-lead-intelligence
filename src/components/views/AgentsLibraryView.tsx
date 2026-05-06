import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAgent } from '@/contexts/AgentContext';
import { promptsApi } from '@/api/prompts';
import {
  Search, Star, Zap, Sparkles, CheckCircle2, Eye,
  Scale, Users, Heart, ShieldCheck, Home, Gavel,
  Car, Hospital, Banknote, Building2, Leaf, Globe,
  Briefcase, Baby, BookOpen, AlertTriangle, Cpu,
  ChevronRight, Bot, ArrowRight, Download, Upload, Trash2,
} from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  area: string;
  tese: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  color: string;
  bgColor: string;
  rating: number;
  conversions: number;
  tag?: string;
  systemPrompt: string;
}

const AGENTS: AgentTemplate[] = [
  {
    id: 'trabalhista',
    name: 'Sofia',
    area: 'Trabalhista',
    tese: 'Rescisão, FGTS, Horas Extras',
    description: 'Triagem completa de casos trabalhistas. Coleta dados do contrato, calcula potencial de indenização e agenda consulta com urgência correta.',
    features: ['Rescisão indireta', 'Horas extras não pagas', 'FGTS + 40%', 'Assédio moral/sexual'],
    icon: Briefcase,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    rating: 4.9,
    conversions: 847,
    tag: 'MAIS ATIVADO',
    systemPrompt: `Você é Sofia, especialista em direito trabalhista do escritório {nome_escritorio}. Seu objetivo é identificar o caso, coletar informações essenciais e agendar uma consulta com o advogado responsável.\n\nAo receber um contato, siga este roteiro:\n1. Apresente-se como Sofia, assistente jurídica trabalhista\n2. Pergunte qual é a situação trabalhista atual (demitido, ainda empregado, autônomo)\n3. Colete: tempo de empresa, última função, se assinou a rescisão, se recebeu tudo\n4. Identifique a tese: rescisão indireta, horas extras, FGTS, acidente de trabalho\n5. Calcule a urgência: prazo de 2 anos após demissão é crítico\n6. Ofereça consulta gratuita e agende pelo calendário\n\nNunca dê valores ou prognóstico de causa. Sempre transfira casos com risco imediato (prazo vencendo) como ALTA URGÊNCIA.`,
  },
  {
    id: 'familia',
    name: 'Ana',
    area: 'Família',
    tese: 'Divórcio, Guarda, Pensão',
    description: 'Atendimento humanizado para casos de família. Abordagem empática, coleta fatos com cuidado e encaminha para o advogado especializado.',
    features: ['Divórcio litigioso e consensual', 'Guarda compartilhada', 'Pensão alimentícia', 'Dissolução de união estável'],
    icon: Heart,
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.08)',
    rating: 4.8,
    conversions: 612,
    systemPrompt: `Você é Ana, especialista em direito de família do escritório {nome_escritorio}. Você tem uma abordagem cuidadosa e empática — este é um momento delicado para o cliente.\n\nRoteiro:\n1. Apresente-se com tom acolhedor\n2. Pergunte sobre o tipo de situação (casados, união estável, separados)\n3. Colete: há filhos? qual é a situação atual da moradia? há bens em comum?\n4. Identifique urgência: violência doméstica (ALTA URGÊNCIA), disputa de guarda ativa, pensão atrasada\n5. Oriente sobre documentos básicos: certidão de casamento, documentos dos filhos\n6. Agende consulta — para casos de violência, ofereça atendimento no mesmo dia\n\nNunca faça julgamentos. Mantenha tom empático e profissional.`,
  },
  {
    id: 'previdenciario',
    name: 'Marco',
    area: 'Previdenciário',
    tese: 'BPC/LOAS, Aposentadoria, Invalidez',
    description: 'Identifica automaticamente o benefício correto para cada perfil. Do BPC/LOAS ao auxílio-acidente, Marco sabe qual é a melhor tese.',
    features: ['BPC/LOAS', 'Aposentadoria por invalidez', 'Auxílio-doença', 'Revisão de benefício'],
    icon: ShieldCheck,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.08)',
    rating: 4.9,
    conversions: 1203,
    tag: 'TOP CONVERSÃO',
    systemPrompt: `Você é Marco, especialista em direito previdenciário do escritório {nome_escritorio}. Seu objetivo é identificar o benefício correto para o cliente.\n\nRoteiro:\n1. Pergunte a situação atual: recebe algum benefício do INSS? Teve benefício negado ou cortado?\n2. Para BPC/LOAS: pergunte a renda familiar per capita e se há deficiência ou idoso +65 anos\n3. Para aposentadoria: tempo de contribuição, idade, se tem CTPS ou contribuiu como autônomo\n4. Para auxílio-doença: qual doença, CID, se está em tratamento, última perícia\n5. Colete documentos necessários: CPF, laudos médicos, histórico de contribuições (CNIS)\n6. Calcule urgência: benefício cortado = ALTA URGÊNCIA\n\nSempre pergunte se há prazo judicial em aberto.`,
  },
  {
    id: 'civel',
    name: 'Beatriz',
    area: 'Cível',
    tese: 'Danos Morais, Indenização',
    description: 'Triagem de casos cíveis com cálculo de potencial indenizatório. Identifica viabilidade e encaminha para o valor certo de causa.',
    features: ['Danos morais', 'Danos materiais', 'Indenização por acidente', 'Contratos descumpridos'],
    icon: Scale,
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.08)',
    rating: 4.7,
    conversions: 534,
    systemPrompt: `Você é Beatriz, especialista em direito civil do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o tipo de caso: dano sofrido, valor envolvido, quem causou\n2. Pergunte se há provas: fotos, prints, notas fiscais, testemunhas\n3. Verifique prazo prescricional: para danos morais são 3 anos do evento\n4. Colete: nome do réu (empresa ou pessoa), CNPJ/CPF, valor estimado do prejuízo\n5. Avalie se o caso tem viabilidade econômica (custo x benefício)\n6. Agende consulta com urgência proporcional ao prazo prescricional\n\nNunca prometa resultado ou valor de indenização.`,
  },
  {
    id: 'consumidor',
    name: 'Carlos',
    area: 'Consumidor',
    tese: 'Negativação, Planos, Cobranças',
    description: 'Do banco que negativou indevidamente à operadora que negou cobertura — Carlos resolve. Aciona CDC e Procon automaticamente.',
    features: ['Negativação indevida', 'Cláusulas abusivas', 'Seguro negado', 'Produto com defeito'],
    icon: ShieldCheck,
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.08)',
    rating: 4.8,
    conversions: 789,
    systemPrompt: `Você é Carlos, especialista em direito do consumidor do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique a empresa fornecedora e o problema\n2. Pergunte se já tentou resolver diretamente com a empresa (protocolo de atendimento)\n3. Colete: valor cobrado indevidamente, data da negativação, nome do credor\n4. Identifique tese: negativação indevida (há dano moral automático!), cobrança abusiva, produto com defeito\n5. Oriente sobre documentos: extrato de negativação, boletos, contrato\n6. Urgência alta se a negativação está ativa (afeta crédito imediatamente)\n\nSempre mencione que dano moral por negativação indevida é presumido (in re ipsa).`,
  },
  {
    id: 'acidente-transito',
    name: 'Patrícia',
    area: 'Acidente de Trânsito',
    tese: 'DPVAT, Indenização, Seguro',
    description: 'Vítimas de acidentes de trânsito merecem atendimento rápido. Patrícia coleta tudo: boletim, laudos, prejuízos — e aciona DPVAT quando aplicável.',
    features: ['DPVAT / SPVAT', 'Indenização do culpado', 'Seguro do veículo', 'Danos corporais e materiais'],
    icon: Car,
    color: '#f87171',
    bgColor: 'rgba(248,113,113,0.08)',
    rating: 4.7,
    conversions: 342,
    systemPrompt: `Você é Patrícia, especialista em acidentes de trânsito do escritório {nome_escritorio}.\n\nRoteiro:\n1. Pergunte a data e local do acidente\n2. Houve lesão corporal? Internação? Incapacidade permanente?\n3. Coletou boletim de ocorrência? Há fotos do local?\n4. Identifique o culpado e se ele tem seguro\n5. Verifique se cabe DPVAT (agora SPVAT) — aplicável a todas vítimas em via pública\n6. Colete: prontuário hospitalar, laudos médicos, fotos, orçamento de conserto\n7. Urgência alta para incapacidade permanente ou óbito\n\nLembre que DPVAT tem prazo de 3 anos. Verifique se não prescreveu.`,
  },
  {
    id: 'plano-saude',
    name: 'Thiago',
    area: 'Plano de Saúde',
    tese: 'Negativa de Cobertura',
    description: 'Negativa de cobertura, reajuste abusivo, descredenciamento de médico — Thiago briga na Justiça e na ANS ao mesmo tempo.',
    features: ['Negativa de procedimento', 'Reajuste abusivo', 'Cancelamento indevido', 'Internação negada'],
    icon: Hospital,
    color: '#06b6d4',
    bgColor: 'rgba(6,182,212,0.08)',
    rating: 4.9,
    conversions: 921,
    tag: 'URGÊNCIA ALTA',
    systemPrompt: `Você é Thiago, especialista em planos de saúde do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o plano de saúde e o que foi negado\n2. Há urgência médica? Risco de vida? — Se sim, URGÊNCIA MÁXIMA (liminar em 24h)\n3. Colete: carta de negativa do plano, receita/pedido médico, CID do procedimento\n4. Verifique se o plano é regulamentado pela ANS (individual, coletivo, empresarial)\n5. Identifique o motivo da negativa: carência, não cobertura, rede credenciada\n6. Oriente sobre tutela de urgência — em negativas de cirurgia urgente conseguimos em 24-48h\n\nPara casos com risco de vida, alerte imediatamente o advogado disponível de plantão.`,
  },
  {
    id: 'bancario',
    name: 'Camila',
    area: 'Bancário',
    tese: 'Superendividamento, Taxas Abusivas',
    description: 'Renegociação forçada de dívidas, juros abusivos e empréstimos consignados irregulares. Camila domina a Lei do Superendividamento.',
    features: ['Superendividamento', 'Juros abusivos', 'Consignado irregular', 'Fraude bancária'],
    icon: Banknote,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    rating: 4.6,
    conversions: 418,
    systemPrompt: `Você é Camila, especialista em direito bancário do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o problema: dívida impagável, cobrança indevida, fraude, consignado não autorizado\n2. Colete: instituição financeira, tipo de contrato, valor original vs valor atual\n3. Pergunte se é aposentado (consignado INSS tem regras especiais)\n4. Para superendividamento: liste todas as dívidas e renda mensal\n5. Calcule se os juros são superiores à taxa de mercado (CET)\n6. Oriente sobre Lei 14.181/2021 (Lei do Superendividamento)\n\nSempre pergunte se há dívidas com mais de 5 anos (prescrição bancária).`,
  },
  {
    id: 'imobiliario',
    name: 'Ricardo',
    area: 'Imobiliário',
    tese: 'Despejo, Usucapião, Construtoras',
    description: 'Do inquilino que precisa ficar ao proprietário que quer despejar — Ricardo cuida do seu imóvel. Especialista em usucapião e vícios de construtoras.',
    features: ['Ação de despejo', 'Usucapião', 'Rescisão com construtora', 'Vícios de construção'],
    icon: Home,
    color: '#84cc16',
    bgColor: 'rgba(132,204,22,0.08)',
    rating: 4.7,
    conversions: 285,
    systemPrompt: `Você é Ricardo, especialista em direito imobiliário do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique se o cliente é locatário, proprietário, comprador ou possuidor\n2. Para despejo: está inadimplente? Por quantos meses? Há fiador?\n3. Para usucapião: há quanto tempo mora? Tem outros proprietários? É área urbana ou rural?\n4. Para construtora: qual o defeito? Está dentro do prazo de garantia (5 anos estrutural)?\n5. Colete documentos: contrato, IPTU, fotos dos defeitos, correspondências\n6. Urgência alta para despejo em andamento ou risco de perda de posse\n\nPrazo de usucapião ordinário: 10 anos. Extraordinário: 15 anos. Urbano pro moradia: 5 anos.`,
  },
  {
    id: 'inventario',
    name: 'Diego',
    area: 'Herança e Inventário',
    tese: 'Inventário, Testamento, Partilha',
    description: 'Inventário judicial e extrajudicial, partilha de bens e reconhecimento de paternidade post-mortem. Diego cuida do seu patrimônio.',
    features: ['Inventário judicial', 'Inventário extrajudicial', 'Partilha de bens', 'Reconhecimento póstumo'],
    icon: BookOpen,
    color: '#7c3aed',
    bgColor: 'rgba(124,58,237,0.08)',
    rating: 4.8,
    conversions: 367,
    systemPrompt: `Você é Diego, especialista em inventário e herança do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o falecido: quando faleceu, deixou testamento?\n2. Há imóvel? Qual é o valor aproximado do patrimônio?\n3. Os herdeiros são maiores de idade e capazes? Há menores?\n4. Há dívidas do falecido? Quais?\n5. Defina a via: extrajudicial (mais rápido, sem conflito, sem menor) ou judicial\n6. Prazo: 60 dias do óbito para abertura do inventário (multa no ITCMD)\n7. Colete: certidão de óbito, documentos do patrimônio, documentos dos herdeiros\n\nSe passou dos 60 dias, colete o inventário com urgência para evitar juros da multa.`,
  },
  {
    id: 'violencia-domestica',
    name: 'Letícia',
    area: 'Violência Doméstica',
    tese: 'Lei Maria da Penha, Medida Protetiva',
    description: 'Atendimento humanizado e urgente para vítimas. Letícia aciona medida protetiva em 48h e orienta sobre todas as proteções da Lei Maria da Penha.',
    features: ['Medida protetiva', 'Boletim de ocorrência', 'Afastamento do agressor', 'Pensão de urgência'],
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: 'rgba(239,68,68,0.08)',
    rating: 5.0,
    conversions: 156,
    tag: 'URGÊNCIA MÁXIMA',
    systemPrompt: `Você é Letícia, especialista em violência doméstica do escritório {nome_escritorio}. ATENÇÃO: este é um atendimento de alta sensibilidade.\n\nRoteiro:\n1. Pergunte se a pessoa está em segurança agora. Se não estiver, oriente a ligar 190 ou 180\n2. Com calma e acolhimento, colete: tipo de violência (física, psicológica, patrimonial)\n3. Há crianças envolvidas? Onde está o agressor agora?\n4. Já fez boletim de ocorrência? Há histórico de violências anteriores?\n5. Oriente sobre a medida protetiva — prazo de 48h para o juiz decidir\n6. Agende atendimento URGENTE — máxima prioridade\n\nNunca questione ou minimize o relato. Sempre valide a experiência da vítima. Alerte o advogado imediatamente após o atendimento.`,
  },
  {
    id: 'empresarial',
    name: 'Fernando',
    area: 'Empresarial',
    tese: 'Contratos, Societário, Recuperação',
    description: 'Do conflito entre sócios à recuperação judicial — Fernando é o advogado que empresas precisam quando o negócio está em risco.',
    features: ['Conflito societário', 'Recuperação judicial', 'Contratos comerciais', 'Due diligence'],
    icon: Building2,
    color: '#0ea5e9',
    bgColor: 'rgba(14,165,233,0.08)',
    rating: 4.7,
    conversions: 198,
    systemPrompt: `Você é Fernando, especialista em direito empresarial do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o tipo de empresa (ME, EPP, SA, Ltda) e o problema\n2. Para conflito societário: quantos sócios? Qual o percentual de cada um? Há acordo de sócios?\n3. Para recuperação: quais são as dívidas? Com quem? Está há mais de 30 dias inadimplente com fornecedores?\n4. Para contratos: qual é o valor envolvido? Há cláusula de rescisão? Há multa?\n5. Colete: contrato social, balanço, lista de credores (para recuperação)\n6. Urgência alta para protestos em série ou pedido de falência em andamento\n\nRecuperação judicial tem prazo: a empresa deve pedir antes que os credores peçam a falência.`,
  },
  {
    id: 'tributario',
    name: 'Helena',
    area: 'Tributário',
    tese: 'Restituição, Parcelamento, Planejamento',
    description: 'Impostos pagos indevidamente e planejamento tributário para economizar. Helena encontra dinheiro que o fisco levou sem direito.',
    features: ['Restituição de IR', 'Parcelamento Refis', 'Planejamento tributário', 'Defesa em fiscalização'],
    icon: Gavel,
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.08)',
    rating: 4.6,
    conversions: 223,
    systemPrompt: `Você é Helena, especialista em direito tributário do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique: pessoa física (IR) ou empresa (IRPJ, CSLL, PIS/Cofins)?\n2. Qual é o problema: dívida ativa, autuação fiscal, IR retido indevidamente?\n3. Para restituição: qual o período? Qual o imposto? Tem documentação de pagamento?\n4. Para parcelamento: qual é o valor total da dívida? Com qual ente (Federal, Estadual, Municipal)?\n5. Para planejamento: qual o faturamento anual? Qual o regime atual (Simples, Lucro Presumido, Real)?\n6. Colete: CNPJ/CPF, exercício fiscal em questão, notificações recebidas\n\nPrazo para restituição: 5 anos a contar do pagamento indevido.`,
  },
  {
    id: 'lgpd',
    name: 'Eduardo',
    area: 'Digital e LGPD',
    tese: 'Vazamento de Dados, Direitos Digitais',
    description: 'Vazamento de dados, fraude por golpe digital, calúnia online — Eduardo é o especialista em direitos na era digital.',
    features: ['Vazamento de dados (LGPD)', 'Fraude digital / Golpe do Pix', 'Crimes digitais', 'Direito ao esquecimento'],
    icon: Cpu,
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.08)',
    rating: 4.8,
    conversions: 312,
    tag: 'ÁREA EM CRESCIMENTO',
    systemPrompt: `Você é Eduardo, especialista em direito digital e LGPD do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique o problema: vazamento de dados, fraude, crime digital, dano à reputação online\n2. Para fraude/golpe: qual o canal (Pix, WhatsApp, ligação)? Qual o valor? Tem prints?\n3. Para vazamento: qual empresa? O cliente já recebeu notificação? Quais dados foram expostos?\n4. Para crime digital: qual é o conteúdo? Onde está publicado? Há prints com data e hora?\n5. Urgência alta para fraude bancária (há prazo de 72h para reversão de Pix)\n6. Colete: prints, links, recibos, boletim de ocorrência digital (delegacia virtual)\n\nPara golpe de Pix: oriente a registrar boletim de ocorrência AGORA e contactar o banco pelo app.`,
  },
  {
    id: 'internacional',
    name: 'Gustavo',
    area: 'Imigração e Internacional',
    tese: 'Visto, Residência, Naturalização',
    description: 'Brasileiros no exterior e estrangeiros no Brasil. Gustavo resolve vistos, residência permanente, naturalização e dupla cidadania.',
    features: ['Visto permanente', 'Naturalização', 'Dupla cidadania', 'Deportação e refúgio'],
    icon: Globe,
    color: '#0ea5e9',
    bgColor: 'rgba(14,165,233,0.08)',
    rating: 4.7,
    conversions: 145,
    systemPrompt: `Você é Gustavo, especialista em imigração do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique: brasileiro no exterior ou estrangeiro no Brasil?\n2. Para estrangeiro: qual o visto atual? Há quanto tempo no Brasil? Trabalha formalmente?\n3. Para naturalização: quantos anos de residência? Há cônjuge ou filho brasileiro?\n4. Para deportação ou problema com refúgio: há urgência imediata?\n5. Para dupla cidadania: qual país de origem? Qual o fundamento (ancestralidade, cônjuge)?\n6. Colete: documentos de identidade de ambos os países, comprovante de residência, visto atual\n\nEstrangeiro com visto vencido: orientar a regularizar ANTES de qualquer outra providência.`,
  },
  {
    id: 'pensao',
    name: 'Mariana',
    area: 'Pensão Alimentícia',
    tese: 'Fixação, Revisão e Execução',
    description: 'Fixação de alimentos, revisão de pensão e execução de inadimplentes — Mariana garante que seus filhos recebam o que é devido.',
    features: ['Fixação de alimentos', 'Revisão de pensão', 'Execução de alimentos', 'Prisão civil por débito'],
    icon: Baby,
    color: '#ec4899',
    bgColor: 'rgba(236,72,153,0.08)',
    rating: 4.9,
    conversions: 634,
    systemPrompt: `Você é Mariana, especialista em alimentos do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique: quer fixar, revisar ou executar pensão?\n2. Para fixação: qual a renda do alimentante? Quantos filhos? Qual a necessidade do menor?\n3. Para revisão: houve mudança de renda (para mais ou para menos)? Há quanto tempo a pensão não é revisada?\n4. Para execução: há quantos meses de atraso? O devedor tem emprego formal? Tem bens?\n5. Urgência alta para execução — penhora de salário e prisão civil são possíveis\n6. Colete: sentença de alimentos, comprovantes de pagamento, documentos do menor\n\nAlimentos tem prioridade na fila judicial. Execução com prisão civil: prazo de 3 dias para pagar ou ir preso.`,
  },
  {
    id: 'ambiental',
    name: 'Roberto',
    area: 'Ambiental e Agrário',
    tese: 'Desapropriação, Conflito de Terra',
    description: 'Produtores rurais e proprietários em conflito com o Estado, vizinhos ou invasores. Roberto garante seu direito à terra.',
    features: ['Desapropriação justa', 'Reintegração de posse', 'Regularização fundiária', 'Multas IBAMA'],
    icon: Leaf,
    color: '#16a34a',
    bgColor: 'rgba(22,163,74,0.08)',
    rating: 4.6,
    conversions: 112,
    systemPrompt: `Você é Roberto, especialista em direito ambiental e agrário do escritório {nome_escritorio}.\n\nRoteiro:\n1. Identifique: produtor rural, proprietário urbano ou pessoa autuada por questão ambiental?\n2. Para desapropriação: recebeu proposta do governo? Qual o valor? O cliente concorda?\n3. Para invasão: há quanto tempo? Quantas pessoas? Há registro de propriedade?\n4. Para multa IBAMA: qual foi a infração? Quando ocorreu? Há auto de infração?\n5. Para regularização: tem posse há quanto tempo? Há registro? É zona rural ou urbana?\n6. Colete: matrícula do imóvel, ITR, fotos, documentos de posse\n\nPara invasão em andamento: reintegração de posse pode ser liminar (imediata) se recente.`,
  },
  {
    id: 'penal',
    name: 'Júlia',
    area: 'Criminal',
    tese: 'Defesa Criminal, Habeas Corpus',
    description: 'Investigados, réus e presos que precisam de defesa. Júlia atua da delegacia ao STJ — habeas corpus, absolvição e revisão criminal.',
    features: ['Defesa em inquérito', 'Habeas corpus', 'Revisão criminal', 'Sursis e progressão'],
    icon: ShieldCheck,
    color: '#dc2626',
    bgColor: 'rgba(220,38,38,0.08)',
    rating: 4.8,
    conversions: 89,
    systemPrompt: `Você é Júlia, especialista em defesa criminal do escritório {nome_escritorio}. Máxima discrição e sigilo são essenciais.\n\nRoteiro:\n1. Identifique a situação: preso (provisório ou condenado), investigado, indiciado ou com processo em andamento?\n2. Se preso: onde está? Qual o crime imputado? Quando foi preso? Há mandado de prisão?\n3. Se investigado: recebeu intimação? Já prestou depoimento? Tem advogado constituído?\n4. Se condenado: qual a pena? Está em qual regime? Há possibilidade de progressão?\n5. Urgência máxima para prisão em flagrante sem advogado\n6. Colete: boletim de ocorrência, intimações, cópia do processo\n\nPara preso em flagrante: audiência de custódia é em 24h. URGÊNCIA MÁXIMA.`,
  },
];

const AREAS = ['Todos', 'Trabalhista', 'Família', 'Previdenciário', 'Cível', 'Consumidor', 'Criminal', 'Bancário', 'Imobiliário', 'Digital e LGPD', 'Empresarial'];

export function AgentsLibraryView() {
  const { toast } = useToast();
  const { addPrompt, updateAgent } = useAgent();
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todos');
  const [previewAgent, setPreviewAgent] = useState<AgentTemplate | null>(null);
  const [showAICreate, setShowAICreate] = useState(false);
  const [aiDescription, setAIDescription] = useState('');
  const [aiGenerating, setAIGenerating] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [customAgents, setCustomAgents] = useState<AgentTemplate[]>([]);

  const allAgents = [...AGENTS, ...customAgents];

  const handleExport = () => {
    const data = allAgents.map(a => ({
      id: a.id, name: a.name, area: a.area, tese: a.tese,
      description: a.description, features: a.features,
      rating: a.rating, conversions: a.conversions, tag: a.tag,
      systemPrompt: a.systemPrompt,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentes-sdr-juridico-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exportado!', description: `${data.length} agentes exportados como JSON.` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const imported: AgentTemplate[] = arr
          .filter((a: AgentTemplate) => a.name && a.systemPrompt)
          .map((a: AgentTemplate, i: number) => ({
            id: `import-${Date.now()}-${i}`,
            name: a.name,
            area: a.area || 'Personalizado',
            tese: a.tese || '',
            description: a.description || '',
            features: a.features || [],
            icon: Bot,
            color: '#8b5cf6',
            bgColor: 'rgba(139,92,246,0.08)',
            rating: a.rating || 5.0,
            conversions: a.conversions || 0,
            tag: 'IMPORTADO',
            systemPrompt: a.systemPrompt,
          }));
        const existingIds = new Set(allAgents.map(a => a.name + a.area));
        const novos = imported.filter(a => !existingIds.has(a.name + a.area));
        setCustomAgents(prev => [...prev, ...novos]);
        toast({ title: 'Importado!', description: `${novos.length} agente(s) adicionado(s) à biblioteca.` });
      } catch {
        toast({ title: 'Erro ao importar', description: 'O arquivo JSON não está no formato correto.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = allAgents.filter(a => {
    const matchSearch = search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.area.toLowerCase().includes(search.toLowerCase()) ||
      a.tese.toLowerCase().includes(search.toLowerCase());
    const matchArea = area === 'Todos' || a.area === area;
    return matchSearch && matchArea;
  });

  const handleActivate = async (agent: AgentTemplate) => {
    setActivating(agent.id);
    try {
      // Salva o system prompt no backend como prompt "Orquestrador" ativo
      await promptsApi.save({
        name: `${agent.name} — ${agent.area}`,
        type: 'Orquestrador',
        version: 'v1',
        status: 'ativo',
        provider: 'OpenAI',
        model: 'gpt-4',
        content: agent.systemPrompt,
        description: agent.description,
        objective: `Triagem e qualificação de leads de ${agent.area}`,
        tone: 'profissional e empático',
      });

      // Atualiza o nome/descrição do agente no contexto local
      updateAgent({
        name: agent.name,
        description: `${agent.area} · ${agent.tese} — ${agent.description}`,
        isActive: true,
      });

      // Adiciona ao contexto de prompts local
      addPrompt({
        id: `lib-${agent.id}-${Date.now()}`,
        name: `${agent.name} — ${agent.area}`,
        type: 'Orquestrador',
        version: 'v1',
        status: 'ativo',
        provider: 'OpenAI',
        model: 'gpt-4',
        content: agent.systemPrompt,
      });

      setActiveAgentId(agent.id);
      toast({
        title: `${agent.name} ativada!`,
        description: `Agente de ${agent.area} salvo e ativo no seu SDR Jurídico.`,
      });
    } catch {
      toast({
        title: 'Erro ao ativar agente',
        description: 'Verifique sua conexão com o backend e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setActivating(null);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiDescription.trim()) return;
    setAIGenerating(true);
    try {
      await promptsApi.save({
        name: `Agente IA Personalizado`,
        type: 'Orquestrador',
        version: 'v1',
        status: 'ativo',
        provider: 'OpenAI',
        model: 'gpt-4',
        content: `Você é um agente jurídico do escritório {nome_escritorio}.\n\nEspecialidade configurada pelo usuário:\n${aiDescription}\n\nSiga sempre os princípios de ética da OAB. Nunca prometa resultados. Colete os dados do cliente, identifique a urgência do caso e agende uma consulta.`,
        description: aiDescription,
        objective: 'Agente jurídico personalizado criado via IA',
      });
      updateAgent({ name: 'Agente IA Personalizado', isActive: true });
      setShowAICreate(false);
      setAIDescription('');
      toast({
        title: 'Agente criado com IA!',
        description: 'Configurado e ativo no seu SDR Jurídico.',
      });
    } catch {
      toast({
        title: 'Erro ao criar agente',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setAIGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Bot className="w-6 h-6 text-amber-500" />
            Biblioteca de Agentes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {allAgents.length} agentes prontos para ativar — {AGENTS.length} pré-configurados{customAgents.length > 0 ? ` + ${customAgents.length} importado(s)` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Button asChild variant="outline" size="sm" className="gap-2 pointer-events-none">
              <span><Upload className="w-4 h-4" />Importar</span>
            </Button>
          </label>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button
            onClick={() => setShowAICreate(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Criar com IA
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar agente ou área jurídica..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {AREAS.slice(0, 6).map(a => (
            <button
              key={a}
              onClick={() => setArea(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                area === a
                  ? 'bg-amber-500 text-black'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Card: Criar com IA */}
        <div
          onClick={() => setShowAICreate(true)}
          className="border border-dashed border-violet-500/40 rounded-xl p-5 cursor-pointer hover:border-violet-500 hover:bg-violet-500/5 transition-all group flex flex-col items-center justify-center gap-3 min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-sm">Criar agente com IA</p>
            <p className="text-xs text-muted-foreground mt-1">Descreva o que precisa e a IA monta tudo</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-violet-400">
            <ArrowRight className="w-3 h-3" />
            Gerar agora
          </div>
        </div>

        {filtered.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            activating={activating === agent.id}
            isActive={activeAgentId === agent.id}
            isCustom={agent.id.startsWith('import-') || agent.tag === 'IMPORTADO'}
            onActivate={() => handleActivate(agent)}
            onPreview={() => setPreviewAgent(agent)}
            onDelete={agent.id.startsWith('import-') ? () => setCustomAgents(prev => prev.filter(a => a.id !== agent.id)) : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhum agente encontrado para "{search}"</p>
        </div>
      )}

      {/* Dialog: Preview do agente */}
      <Dialog open={!!previewAgent} onOpenChange={() => setPreviewAgent(null)}>
        <DialogContent className="max-w-2xl">
          {previewAgent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: previewAgent.bgColor }}
                  >
                    <previewAgent.icon className="w-5 h-5" style={{ color: previewAgent.color }} />
                  </div>
                  <div>
                    <span>{previewAgent.name}</span>
                    <Badge className="ml-2 text-xs" style={{ background: previewAgent.bgColor, color: previewAgent.color }}>
                      {previewAgent.area}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted-foreground">{previewAgent.description}</p>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Roteiro do agente (system prompt)</p>
                  <pre className="bg-muted/50 rounded-lg p-4 text-xs whitespace-pre-wrap font-mono text-foreground/80 max-h-60 overflow-auto">
                    {previewAgent.systemPrompt}
                  </pre>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => { handleActivate(previewAgent); setPreviewAgent(null); }}
                    className="flex-1"
                    style={{ background: previewAgent.color }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ativar este agente
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewAgent(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar com IA */}
      <Dialog open={showAICreate} onOpenChange={setShowAICreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Criar agente com IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Descreva para a IA o agente que você precisa. Quanto mais detalhe, melhor o resultado.
            </p>
            <Textarea
              value={aiDescription}
              onChange={e => setAIDescription(e.target.value)}
              placeholder="Ex: Quero um agente para captação de clientes vítimas de golpes financeiros no WhatsApp. O agente deve identificar o valor perdido, coletar prints e dados do golpista, e já orientar o cliente a ir à delegacia enquanto agenda a consulta..."
              rows={6}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {['Trabalhista para empregadas domésticas', 'BPC/LOAS para idosos', 'Consumidor contra bancos', 'Danos morais médicos'].map(ex => (
                <button
                  key={ex}
                  onClick={() => setAIDescription(ex)}
                  className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button
              onClick={handleAIGenerate}
              disabled={!aiDescription.trim() || aiGenerating}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {aiGenerating ? (
                <><span className="animate-spin mr-2">⚡</span>Gerando agente...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Gerar agente agora</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentCard({
  agent,
  activating,
  isActive,
  isCustom,
  onActivate,
  onPreview,
  onDelete,
}: {
  agent: AgentTemplate;
  activating: boolean;
  isActive: boolean;
  isCustom?: boolean;
  onActivate: () => void;
  onPreview: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`border rounded-xl p-5 flex flex-col gap-3 transition-all group ${isActive ? 'border-green-500 bg-green-500/5' : 'border-border hover:border-amber-500/30 hover:bg-amber-500/[0.02]'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: agent.bgColor }}
          >
            <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{agent.name}</span>
              {agent.tag && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: agent.bgColor, color: agent.color }}
                >
                  {agent.tag}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{agent.area}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-amber-400">
          <Star className="w-3 h-3 fill-amber-400" />
          {agent.rating}
        </div>
      </div>

      {/* Tese */}
      <div>
        <Badge variant="outline" className="text-[10px]" style={{ borderColor: agent.color + '40', color: agent.color }}>
          {agent.tese}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{agent.description}</p>

      {/* Features */}
      <div className="flex flex-wrap gap-1">
        {agent.features.slice(0, 3).map(f => (
          <span key={f} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
            {f}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{agent.conversions.toLocaleString('pt-BR')} leads convertidos</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          onClick={onActivate}
          disabled={activating || isActive}
          className={`flex-1 text-xs ${isActive ? 'bg-green-600 text-white hover:bg-green-600' : 'text-black hover:opacity-90'}`}
          style={isActive ? {} : { background: agent.color }}
        >
          {activating ? (
            <span className="animate-pulse">Ativando...</span>
          ) : isActive ? (
            <><CheckCircle2 className="w-3 h-3 mr-1" />Ativo</>
          ) : (
            <><Zap className="w-3 h-3 mr-1" />Ativar</>
          )}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onPreview} className="text-xs gap-1">
          <Eye className="w-3 h-3" />
          Ver prompt
        </Button>
        {isCustom && onDelete && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
