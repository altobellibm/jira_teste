// Definições dos formulários do portal. Nomes de tipo de ticket e de solicitação marcados com
// "(provisório)" não foram vistos nas telas do Jira; confirme-os na fase do Jira real.
import {
  APROVADORES_ADICIONAIS, CLIENTES_AFETADOS, ESCOLARIDADES, GRUPOS_APROVADORES,
  NIVEIS_ACESSO_INFORMACAO, REGIMES_CONTRATACAO, RESPONSAVEIS, SUBSTITUICAO_OU_NOVA, TIPOS_MUDANCA,
  AUTOMATICO,
} from './lists';
import type { FieldDef, FormDef, Option } from './types';

/* ---------- Construtores de campo ---------- */
const field = (kind: FieldDef['kind']) => (id: string, label: string, extra: Partial<FieldDef> = {}): FieldDef =>
  ({ id, label, kind, required: true, ...extra });
const text = field('text');
const textarea = field('textarea');
const richtext = field('richtext');
const select = (id: string, label: string, options: Option[], extra: Partial<FieldDef> = {}) =>
  field('select')(id, label, { options, ...extra });
const date = field('date');
const datetime = field('datetime');

const resumo = text('summary', 'Resumo');
const descricao = (placeholder: string) => richtext('description', 'Descrição', { placeholder });

/* ---------- Incidente ---------- */
export const incidente: FormDef = {
  id: 'incidente',
  title: 'Relatar um Incidente',
  issueType: 'Incidente Interno',
  requestType: 'Incidente Interno',
  fields: [resumo, descricao('Descreva o que parou ou está indisponível, desde quando e quem foi afetado.')],
};

/* ---------- Requisição: Área → Tipo → formulário ---------- */
export interface RequestKind { id: string; label: string; form: FormDef }
export interface RequestArea { id: string; label: string; kinds: RequestKind[] }

const SERVICO = { id: 'solicitacao-servico', label: 'Solicitação de Serviço' };

const simpleRequest = (
  areaId: string, kind: { id: string; label: string }, issueType: string, requestType: string | null,
  serviceCatalog?: string,
): RequestKind => ({
  id: kind.id,
  label: kind.label,
  form: {
    id: `requisicao-${areaId}-${kind.id}`,
    title: 'Fazer uma requisição',
    issueType,
    requestType,
    ...(serviceCatalog ? { serviceCatalog } : {}),
    fields: [resumo, descricao('Descreva o que você precisa.')],
  },
});

/** Contratação: um campo por linha do modelo que o RH usa hoje na Descrição. */
const contratacao: FormDef = {
  id: 'requisicao-rh-contratacao',
  title: 'Fazer uma requisição',
  issueType: 'Requisição Interna - RH',
  requestType: 'RH: Requisição de Contratação',
  fields: [
    resumo,
    text('gestor', 'Gestor responsável'),
    text('cargo', 'Cargo a ser ocupado'),
    select('tipo-posicao', 'Substituição ou nova posição', SUBSTITUICAO_OU_NOVA),
    select('regime', 'Regime de contratação', REGIMES_CONTRATACAO),
    text('faixa-salarial', 'Faixa salarial'),
    text('centro-custo', 'Centro de custo'),
    select('escolaridade', 'Nível de escolaridade', ESCOLARIDADES),
    textarea('atividades', 'Principais atividades que serão exercidas'),
    select('acesso-informacao', 'Nível de acesso à informação', NIVEIS_ACESSO_INFORMACAO),
    text('idiomas', 'Idiomas requeridos para a vaga', { required: false }),
    textarea('experiencias', 'Experiências anteriores desejadas', { required: false }),
    date('inicio', 'Data prevista de início'),
  ],
  descriptionLayout: [
    { text: '📋 Preencha antes de enviar' },
    { field: 'gestor' },
    { text: 'Informações da vaga solicitada' },
    { field: 'cargo' }, { field: 'tipo-posicao' }, { field: 'regime' }, { field: 'faixa-salarial' },
    { field: 'centro-custo' }, { field: 'escolaridade' }, { field: 'atividades' }, { field: 'acesso-informacao' },
    { field: 'idiomas' }, { field: 'experiencias' }, { field: 'inicio' },
  ],
};

const desligamento: FormDef = {
  id: 'requisicao-rh-desligamento',
  title: 'Fazer uma requisição',
  issueType: 'Requisição Interna - RH',
  requestType: 'RH: Desligamento', // (provisório)
  fields: [
    resumo,
    text('membro', 'Nome do membro'),
    text('funcao', 'Função'),
    date('data-desligamento', 'Data prevista do desligamento'),
    textarea('justificativa', 'Justificativa da demissão'),
  ],
  descriptionLayout: [
    { text: '📋 Informe as informações do colaborador' },
    { field: 'membro' }, { field: 'funcao' }, { field: 'data-desligamento' }, { field: 'justificativa' },
  ],
};

const RH_ISSUE = 'Requisição Interna - RH';
const SUPORTE_ISSUE = 'Requisição Interna - Suporte';

export const REQUEST_CATALOG: RequestArea[] = [
  {
    id: 'rh', label: 'RH',
    kinds: [
      { id: 'contratacao', label: 'Contratação', form: contratacao },
      { id: 'desligamento', label: 'Desligamento', form: desligamento },
      simpleRequest('rh', { id: 'relatorios', label: 'Relatórios' }, RH_ISSUE, 'RH: Relatórios'), // (provisório)
      simpleRequest('rh', SERVICO, RH_ISSUE, 'RH: Solicitação de Serviços'),
    ],
  },
  {
    // No Jira o Suporte não tem tipo de solicitação: o tipo vai no campo "Catálogo de Serviço".
    id: 'suporte', label: 'Suporte',
    kinds: [
      simpleRequest('suporte', { id: 'criacao-usuario', label: 'Criação de Usuário' }, SUPORTE_ISSUE, null, 'Criação de Usuário'),
      simpleRequest('suporte', { id: 'remocao-usuario', label: 'Remoção de Usuário' }, SUPORTE_ISSUE, null, 'Remoção de Usuário'),
      simpleRequest('suporte', SERVICO, SUPORTE_ISSUE, null, 'Solicitação de Serviço'), // (provisório)
    ],
  },
  { id: 'engenharia', label: 'Engenharia', kinds: [simpleRequest('engenharia', SERVICO, 'Requisição Interna - Engenharia', 'Engenharia: Solicitação de Serviço')] }, // (provisório)
  { id: 'dev-software', label: 'Dev de Software', kinds: [simpleRequest('dev-software', SERVICO, 'Requisição Interna - Dev de Software', 'Dev de Software: Solicitação de Serviço')] }, // (provisório)
  { id: 'eng-dados', label: 'Eng. Dados', kinds: [simpleRequest('eng-dados', SERVICO, 'Requisição Interna - Eng. Dados', 'Eng. Dados: Solicitação de Serviço')] }, // (provisório)
  { id: 'arquitetura', label: 'Arquitetura', kinds: [simpleRequest('arquitetura', SERVICO, 'Requisição Interna - Arquitetura', 'Arquitetura: Solicitação de Serviço')] }, // (provisório)
  { id: 'projetos', label: 'Projetos', kinds: [simpleRequest('projetos', SERVICO, 'Requisição Interna - Projetos', 'Projetos: Solicitação de Serviço')] }, // (provisório)
];

/* ---------- Mudança: os 16 campos, na ordem do Jira ---------- */
export const PLANO_IMPLEMENTACAO_CABECALHO = 'Data | Hora | Descrição da ação';

export const mudanca: FormDef = {
  id: 'mudanca',
  title: 'Registrar uma Mudança',
  issueType: '[Clientes WIISE] Mudança',
  requestType: 'Mudança',
  fields: [
    select('tipo-mudanca', 'Tipo de mudança', TIPOS_MUDANCA),
    select('cliente-afetado', 'Cliente afetado', CLIENTES_AFETADOS),
    richtext('ativo-informacao', 'Ativo de informação'),
    richtext('descricao-risco', 'Descrição de Risco'),
    richtext('impacto', 'Impacto da Mudança'),
    resumo,
    text('tecnico', 'Técnico envolvido'),
    richtext('descricao-mudanca', 'Descrição de mudança', { placeholder: '[Descreva o motivo desta mudança]' }),
    field('code')('plano-implementacao', 'Plano de implementação', { initial: PLANO_IMPLEMENTACAO_CABECALHO }),
    richtext('plano-rollback', 'Plano de volta (rollback)'),
    richtext('plano-teste', 'Plano de teste'),
    datetime('inicio', 'Data de início planejado'),
    datetime('termino', 'Data de término planejado', {
      notBefore: { field: 'inicio', message: 'A data de término não pode ser anterior ao início.' },
    }),
    select('responsavel', 'Responsável', RESPONSAVEIS, { initial: AUTOMATICO.id, assignToMe: true }),
    select('grupo-aprovadores', 'Grupo de aprovadores', GRUPOS_APROVADORES),
    field('multiselect')('aprovadores-adicionais', 'Aprovadores adicionais', { required: false, options: APROVADORES_ADICIONAIS }),
  ],
};
