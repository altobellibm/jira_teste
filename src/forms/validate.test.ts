import { describe, expect, it } from 'vitest';
import { PLANO_IMPLEMENTACAO_CABECALHO, REQUEST_CATALOG, incidente, mudanca } from './definitions';
import { defaultValues } from './ticket';
import { codeHasContent, validate } from './validate';
import type { Values } from './types';

const contratacao = REQUEST_CATALOG[0].kinds[0].form;

/** Mudança com tudo preenchido de forma válida. */
const mudancaValida = (): Values => ({
  ...defaultValues(mudanca),
  'tipo-mudanca': 'planejada',
  'cliente-afetado': 'wiise',
  'ativo-informacao': 'Servidor X',
  'descricao-risco': 'Baixo',
  impacto: 'Nenhum',
  summary: 'Atualizar o servidor X',
  tecnico: 'Ana',
  'descricao-mudanca': 'Patch de segurança',
  'plano-implementacao': `${PLANO_IMPLEMENTACAO_CABECALHO}\n10/12 | 22:00 | Aplicar patch`,
  'plano-rollback': 'Restaurar snapshot',
  'plano-teste': 'Smoke test',
  inicio: '2026-12-10T22:00',
  termino: '2026-12-10T23:00',
  'grupo-aprovadores': 'gestao-ti',
});

describe('validate', () => {
  it('aponta os campos obrigatórios vazios, na ordem do formulário', () => {
    const errors = validate(incidente, defaultValues(incidente));
    expect(Object.keys(errors)).toEqual(['summary', 'description']);
    expect(errors.summary).toBe('Preencha o campo resumo.');
  });

  it('trata espaços em branco como vazio', () => {
    expect(validate(incidente, { summary: '   ', description: '\n ' })).toHaveProperty('summary');
  });

  it('aceita o incidente preenchido', () => {
    expect(validate(incidente, { summary: 'Sistema fora do ar', description: 'Desde 9h' })).toEqual({});
  });

  it('usa "Selecione" para campos de lista', () => {
    const errors = validate(contratacao, defaultValues(contratacao));
    expect(errors.regime).toBe('Selecione regime de contratação.');
  });

  it('campos opcionais vazios não geram erro (Contratação: idiomas e experiências)', () => {
    const errors = validate(contratacao, defaultValues(contratacao));
    expect(errors).not.toHaveProperty('idiomas');
    expect(errors).not.toHaveProperty('experiencias');
  });

  it('exige data completa em campos de data', () => {
    const values = { ...defaultValues(contratacao), inicio: '2026-1-5' };
    expect(validate(contratacao, values).inicio).toMatch(/Informe a data/);
  });

  it('Mudança preenchida corretamente não tem erros', () => {
    expect(validate(mudanca, mudancaValida())).toEqual({});
  });

  it('Responsável já vem com "Automático" e não bloqueia o envio', () => {
    expect(validate(mudanca, defaultValues(mudanca))).not.toHaveProperty('responsavel');
  });

  it('exige data e horário completos', () => {
    const errors = validate(mudanca, { ...mudancaValida(), inicio: '2026-12-10T' });
    expect(errors.inicio).toMatch(/data e o horário/);
  });

  it('o término não pode ser anterior ao início', () => {
    const errors = validate(mudanca, { ...mudancaValida(), termino: '2026-12-10T21:59' });
    expect(errors.termino).toBe('A data de término não pode ser anterior ao início.');
  });

  it('o término igual ao início é aceito', () => {
    expect(validate(mudanca, { ...mudancaValida(), termino: '2026-12-10T22:00' })).toEqual({});
  });

  it('o plano de implementação só com o cabeçalho é inválido', () => {
    const errors = validate(mudanca, { ...mudancaValida(), 'plano-implementacao': PLANO_IMPLEMENTACAO_CABECALHO });
    expect(errors['plano-implementacao']).toMatch(/ao menos uma linha/);
  });
});

describe('codeHasContent', () => {
  it('ignora linhas vazias e o cabeçalho', () => {
    expect(codeHasContent('Data | Hora | Descrição da ação\n\n  ', 'Data | Hora | Descrição da ação')).toBe(false);
    expect(codeHasContent('Data | Hora | Descrição da ação\n10/12 | 22:00 | x', 'Data | Hora | Descrição da ação')).toBe(true);
    expect(codeHasContent('qualquer coisa')).toBe(true);
  });
});
