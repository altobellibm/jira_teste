import { describe, expect, it } from 'vitest';
import { REQUEST_CATALOG, incidente, mudanca } from './definitions';
import { buildTicketInput, composeDescription, defaultValues, displayValue, ticketDetails } from './ticket';
import type { Values } from './types';

const rh = REQUEST_CATALOG.find((a) => a.id === 'rh')!;
const suporte = REQUEST_CATALOG.find((a) => a.id === 'suporte')!;
const contratacao = rh.kinds.find((k) => k.id === 'contratacao')!.form;
const desligamento = rh.kinds.find((k) => k.id === 'desligamento')!.form;

const contratacaoPreenchida = (): Values => ({
  ...defaultValues(contratacao),
  summary: 'Contratar analista de dados',
  gestor: 'Maria Silva',
  cargo: 'Analista de Dados',
  'tipo-posicao': 'nova-posicao',
  regime: 'clt',
  'faixa-salarial': 'R$ 8.000 a R$ 10.000',
  'centro-custo': '1020',
  escolaridade: 'graduacao',
  atividades: 'Modelar dados.\nCriar dashboards.',
  'acesso-informacao': 'interno',
  inicio: '2027-02-01',
});

describe('composeDescription', () => {
  it('usa o campo Descrição quando o formulário não tem modelo', () => {
    expect(composeDescription(incidente, { summary: 'x', description: '  Caiu tudo  ' })).toBe('Caiu tudo');
  });

  it('monta o modelo de Contratação com uma linha "Rótulo: valor" por campo', () => {
    expect(composeDescription(contratacao, contratacaoPreenchida())).toBe([
      '📋 Preencha antes de enviar',
      'Gestor responsável: Maria Silva',
      'Informações da vaga solicitada',
      'Cargo a ser ocupado: Analista de Dados',
      'Substituição ou nova posição: Nova posição',
      'Regime de contratação: CLT',
      'Faixa salarial: R$ 8.000 a R$ 10.000',
      'Centro de custo: 1020',
      'Nível de escolaridade: Graduação',
      'Principais atividades que serão exercidas: Modelar dados.\nCriar dashboards.',
      'Nível de acesso à informação: Interno',
      'Idiomas requeridos para a vaga: —',
      'Experiências anteriores desejadas: —',
      'Data prevista de início: 01/02/2027',
    ].join('\n\n'));
  });

  it('monta o modelo de Desligamento', () => {
    const values: Values = {
      ...defaultValues(desligamento), summary: 'Desligamento', membro: 'João', funcao: 'Dev',
      'data-desligamento': '2026-12-31', justificativa: 'Fim de contrato',
    };
    expect(composeDescription(desligamento, values)).toBe([
      '📋 Informe as informações do colaborador',
      'Nome do membro: João',
      'Função: Dev',
      'Data prevista do desligamento: 31/12/2026',
      'Justificativa da demissão: Fim de contrato',
    ].join('\n\n'));
  });
});

describe('displayValue', () => {
  const field = (id: string) => mudanca.fields.find((f) => f.id === id)!;
  it('mostra o rótulo da opção, e não o id', () => {
    expect(displayValue(field('cliente-afetado'), 'imagelog')).toBe('ImageLog');
  });
  it('junta seleções múltiplas', () => {
    expect(displayValue(field('aprovadores-adicionais'), ['ana-souza', 'bruno-lima'])).toBe('Ana Souza, Bruno Lima');
  });
  it('formata data e hora em pt-BR', () => {
    expect(displayValue(field('inicio'), '2026-12-10T22:00')).toBe('10/12/2026 22:00');
  });
  it('mostra um traço quando vazio', () => {
    expect(displayValue(field('tecnico'), '  ')).toBe('—');
    expect(displayValue(field('aprovadores-adicionais'), [])).toBe('—');
  });
});

describe('buildTicketInput', () => {
  it('leva os tipos do Jira, o resumo sem espaços e a descrição final', () => {
    const input = buildTicketInput(incidente, { summary: '  Sem acesso ao ERP ', description: 'Desde cedo' });
    expect(input).toMatchObject({
      formId: 'incidente', issueType: 'Incidente Interno', requestType: 'Incidente Interno',
      summary: 'Sem acesso ao ERP', description: 'Desde cedo',
    });
    expect(input).not.toHaveProperty('serviceCatalog');
  });

  it('no Suporte o tipo de solicitação é vazio e o Catálogo de Serviço é enviado', () => {
    const criacao = suporte.kinds.find((k) => k.id === 'criacao-usuario')!.form;
    const input = buildTicketInput(criacao, { summary: 'Novo usuário', description: 'Para o João' });
    expect(input.requestType).toBeNull();
    expect(input.issueType).toBe('Requisição Interna - Suporte');
    expect(input.serviceCatalog).toBe('Criação de Usuário');
  });
});

describe('ticketDetails', () => {
  it('começa pelos tipos do ticket e omite o Resumo', () => {
    const details = ticketDetails(incidente, { summary: 'x', description: 'y' });
    expect(details.map((d) => d.label)).toEqual(['Tipo do ticket', 'Tipo de solicitação', 'Descrição']);
  });

  it('mostra "Nenhum" e o Catálogo de Serviço no Suporte', () => {
    const remocao = suporte.kinds.find((k) => k.id === 'remocao-usuario')!.form;
    const details = ticketDetails(remocao, { summary: 'x', description: 'y' });
    expect(details.find((d) => d.label === 'Tipo de solicitação')?.value).toBe('Nenhum');
    expect(details.find((d) => d.label === 'Suporte: Catálogo de Serviço')?.value).toBe('Remoção de Usuário');
  });

  it('marca o plano de implementação como código', () => {
    const details = ticketDetails(mudanca, defaultValues(mudanca));
    expect(details.find((d) => d.label === 'Plano de implementação')?.code).toBe(true);
  });
});

describe('defaultValues', () => {
  it('Responsável começa em "Automático", o plano com o cabeçalho e a multisseleção vazia', () => {
    const v = defaultValues(mudanca);
    expect(v.responsavel).toBe('automatico');
    expect(v['plano-implementacao']).toBe('Data | Hora | Descrição da ação');
    expect(v['aprovadores-adicionais']).toEqual([]);
    expect(v.summary).toBe('');
  });
});
