import { describe, expect, it } from 'vitest';
import { createMockApi } from '../api/mock';
import { resolveSelection } from './deeplink';
import { REQUEST_CATALOG, incidente } from './definitions';
import { formatDate, formatDateTime, joinDateTime, splitDateTime } from './datetime';
import { FORMATS, wrapSelection } from './editor';
import { buildTicketInput } from './ticket';

describe('resolveSelection (links ?area=&tipo=)', () => {
  it('seleciona área e tipo válidos', () => {
    expect(resolveSelection(REQUEST_CATALOG, 'suporte', 'criacao-usuario')).toEqual({ areaId: 'suporte', kindId: 'criacao-usuario' });
  });
  it('área sem tipo deixa o tipo vazio quando há mais de um', () => {
    expect(resolveSelection(REQUEST_CATALOG, 'rh', null)).toEqual({ areaId: 'rh', kindId: '' });
  });
  it('tipo que não pertence à área é ignorado', () => {
    expect(resolveSelection(REQUEST_CATALOG, 'rh', 'criacao-usuario')).toEqual({ areaId: 'rh', kindId: '' });
  });
  it('área com um único tipo escolhe o tipo sozinha', () => {
    expect(resolveSelection(REQUEST_CATALOG, 'engenharia', null)).toEqual({ areaId: 'engenharia', kindId: 'solicitacao-servico' });
  });
  it('área desconhecida ou ausente limpa tudo', () => {
    expect(resolveSelection(REQUEST_CATALOG, 'financeiro', 'x')).toEqual({ areaId: '', kindId: '' });
    expect(resolveSelection(REQUEST_CATALOG, null, 'contratacao')).toEqual({ areaId: '', kindId: '' });
  });
});

describe('datas', () => {
  it('separa e junta data e hora, inclusive parciais', () => {
    expect(splitDateTime('2026-12-10T22:00')).toEqual({ date: '2026-12-10', time: '22:00' });
    expect(splitDateTime('2026-12-10')).toEqual({ date: '2026-12-10', time: '' });
    expect(joinDateTime('2026-12-10', '')).toBe('2026-12-10T');
    expect(joinDateTime('', '')).toBe('');
  });
  it('formata em pt-BR e devolve o texto original se for inválido', () => {
    expect(formatDate('2026-12-10')).toBe('10/12/2026');
    expect(formatDateTime('2026-12-10T22:00')).toBe('10/12/2026 22:00');
    expect(formatDate('amanhã')).toBe('amanhã');
  });
});

describe('wrapSelection (editor)', () => {
  it('envolve a seleção e a mantém selecionada', () => {
    const edit = wrapSelection('olá mundo', 4, 9, FORMATS.bold.before, FORMATS.bold.after);
    expect(edit.value).toBe('olá **mundo**');
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe('mundo');
  });
  it('sem seleção insere os marcadores e deixa o cursor entre eles', () => {
    const edit = wrapSelection('', 0, 0, FORMATS.link.before, FORMATS.link.after);
    expect(edit.value).toBe('[](https://)');
    expect(edit.selectionStart).toBe(1);
    expect(edit.selectionEnd).toBe(1);
  });
  it('bloco de código fica em linhas próprias', () => {
    expect(wrapSelection('x', 0, 1, FORMATS.codeBlock.before, FORMATS.codeBlock.after).value).toBe('\n```\nx\n```\n');
  });
});

describe('API simulada', () => {
  it('gera chaves em sequência a partir de REP-101 e devolve o que recebeu', async () => {
    const api = createMockApi({ delayMs: 0 });
    const input = buildTicketInput(incidente, { summary: 'Teste', description: 'Corpo' });
    const a = await api.createTicket(input);
    const b = await api.createTicket(input);
    expect([a.key, b.key]).toEqual(['REP-101', 'REP-102']);
    expect(a.input).toEqual(input);
    expect(a.url).toBeUndefined();
  });
});
