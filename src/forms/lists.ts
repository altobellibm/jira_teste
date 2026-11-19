// Listas usadas pelos selects. Os dados de pessoas e grupos são FICTÍCIOS (o site é público).
// Troque pelas listas reais aqui quando elas existirem; nenhum outro arquivo precisa mudar.
import type { Option } from './types';

/** Usuário simulado que "Atribuir a mim" seleciona. */
export const CURRENT_USER: Option = { id: 'pessoa-demo', label: 'Pessoa Demonstração' };

export const PESSOAS: Option[] = [
  CURRENT_USER,
  { id: 'ana-souza', label: 'Ana Souza' },
  { id: 'bruno-lima', label: 'Bruno Lima' },
  { id: 'carla-mendes', label: 'Carla Mendes' },
  { id: 'diego-ramos', label: 'Diego Ramos' },
];

export const AUTOMATICO: Option = { id: 'automatico', label: 'Automático' };
export const RESPONSAVEIS: Option[] = [AUTOMATICO, ...PESSOAS];

export const GRUPOS_APROVADORES: Option[] = [
  { id: 'comite-mudancas', label: 'Comitê de Mudanças' },
  { id: 'gestao-ti', label: 'Gestão de TI' },
  { id: 'diretoria', label: 'Diretoria' },
];

export const APROVADORES_ADICIONAIS: Option[] = PESSOAS;

export const TIPOS_MUDANCA: Option[] = [
  { id: 'planejada', label: 'Planejada' },
  { id: 'emergencial', label: 'Emergencial' },
  { id: 'rotina', label: 'Rotina' },
];

export const CLIENTES_AFETADOS: Option[] = [
  { id: 'wiise', label: 'WIISE' },
  { id: 'replan', label: 'REPLAN' },
  { id: 'imagelog', label: 'ImageLog' },
];

// Opções de Contratação: ainda não vi as listas reais; são valores provisórios.
export const SUBSTITUICAO_OU_NOVA: Option[] = [
  { id: 'substituicao', label: 'Substituição' },
  { id: 'nova-posicao', label: 'Nova posição' },
];
export const REGIMES_CONTRATACAO: Option[] = [
  { id: 'clt', label: 'CLT' },
  { id: 'pj', label: 'PJ' },
  { id: 'estagio', label: 'Estágio' },
  { id: 'temporario', label: 'Temporário' },
];
export const ESCOLARIDADES: Option[] = [
  { id: 'medio', label: 'Ensino médio' },
  { id: 'tecnico', label: 'Técnico' },
  { id: 'graduacao', label: 'Graduação' },
  { id: 'pos', label: 'Pós-graduação' },
];
export const NIVEIS_ACESSO_INFORMACAO: Option[] = [
  { id: 'publico', label: 'Público' },
  { id: 'interno', label: 'Interno' },
  { id: 'confidencial', label: 'Confidencial' },
];
