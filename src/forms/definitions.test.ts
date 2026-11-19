import { describe, expect, it } from 'vitest';
import { REQUEST_CATALOG, incidente, mudanca } from './definitions';
import type { FormDef } from './types';

const allForms = (): FormDef[] => [incidente, mudanca, ...REQUEST_CATALOG.flatMap((a) => a.kinds.map((k) => k.form))];

describe('definições dos formulários', () => {
  it('todo formulário tem Resumo obrigatório e ids de campo e de formulário únicos', () => {
    const formIds = allForms().map((f) => f.id);
    expect(new Set(formIds).size).toBe(formIds.length);
    for (const form of allForms()) {
      const ids = form.fields.map((f) => f.id);
      expect(new Set(ids).size, form.id).toBe(ids.length);
      expect(form.fields.find((f) => f.id === 'summary')?.required, form.id).toBe(true);
    }
  });

  it('Incidente tem só Resumo e Descrição', () => {
    expect(incidente.fields.map((f) => f.id)).toEqual(['summary', 'description']);
    expect(incidente.issueType).toBe('Incidente Interno');
  });

  it('Mudança mostra os 16 campos, com Responsável visível e só Aprovadores adicionais opcional', () => {
    expect(mudanca.fields).toHaveLength(16);
    expect(mudanca.fields.find((f) => f.id === 'responsavel')?.initial).toBe('automatico');
    expect(mudanca.fields.filter((f) => !f.required).map((f) => f.id)).toEqual(['aprovadores-adicionais']);
  });

  it('as 7 áreas existem, com os tipos combinados', () => {
    expect(REQUEST_CATALOG.map((a) => a.id)).toEqual(
      ['rh', 'suporte', 'engenharia', 'dev-software', 'eng-dados', 'arquitetura', 'projetos'],
    );
    const kinds = (id: string) => REQUEST_CATALOG.find((a) => a.id === id)!.kinds.map((k) => k.id);
    expect(kinds('rh')).toEqual(['contratacao', 'desligamento', 'relatorios', 'solicitacao-servico']);
    expect(kinds('suporte')).toEqual(['criacao-usuario', 'remocao-usuario', 'solicitacao-servico']);
    for (const id of ['engenharia', 'dev-software', 'eng-dados', 'arquitetura', 'projetos']) {
      expect(kinds(id)).toEqual(['solicitacao-servico']);
    }
  });

  it('Contratação tem 12 campos além do Resumo, e Desligamento tem 4', () => {
    const rh = REQUEST_CATALOG.find((a) => a.id === 'rh')!;
    const form = (id: string) => rh.kinds.find((k) => k.id === id)!.form;
    expect(form('contratacao').fields.filter((f) => f.id !== 'summary')).toHaveLength(12);
    expect(form('desligamento').fields.filter((f) => f.id !== 'summary')).toHaveLength(4);
    expect(form('contratacao').fields.filter((f) => !f.required).map((f) => f.id)).toEqual(['idiomas', 'experiencias']);
  });

  it('Suporte usa o Catálogo de Serviço e não tem tipo de solicitação', () => {
    const suporte = REQUEST_CATALOG.find((a) => a.id === 'suporte')!;
    for (const k of suporte.kinds) {
      expect(k.form.requestType).toBeNull();
      expect(k.form.serviceCatalog).toBe(k.label);
    }
  });

  it('todo campo de seleção tem opções e todo trecho do layout aponta para um campo existente', () => {
    for (const form of allForms()) {
      for (const f of form.fields) if (f.kind === 'select' || f.kind === 'multiselect') expect(f.options?.length, `${form.id}.${f.id}`).toBeGreaterThan(0);
      for (const part of form.descriptionLayout ?? []) {
        if ('field' in part) expect(form.fields.some((f) => f.id === part.field), `${form.id}:${part.field}`).toBe(true);
      }
    }
  });
});
