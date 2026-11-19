import { describe, expect, it } from 'vitest';
import { incidente, mudanca, REQUEST_CATALOG } from './definitions';
import { fieldSpans } from './layout';
import type { FieldKind } from './types';

const f = (id: string, kind: FieldKind) => ({ id, kind });

describe('fieldSpans', () => {
  it('campos curtos seguidos formam pares; textos longos e o Resumo ocupam a linha inteira', () => {
    expect(fieldSpans([f('summary', 'text'), f('a', 'text'), f('b', 'select'), f('c', 'richtext')]))
      .toEqual(['full', 'half', 'half', 'full']);
  });

  it('um campo curto sozinho antes de um largo vira linha inteira, para não deixar buraco', () => {
    expect(fieldSpans([f('a', 'text'), f('b', 'textarea')])).toEqual(['full', 'full']);
    expect(fieldSpans([f('a', 'text'), f('b', 'text'), f('c', 'select'), f('d', 'code')]))
      .toEqual(['half', 'half', 'full', 'full']);
  });

  it('o último campo pode ficar em meia linha', () => {
    expect(fieldSpans([f('a', 'text'), f('b', 'text'), f('c', 'date')])).toEqual(['half', 'half', 'half']);
  });

  it('formulário vazio não tem larguras', () => {
    expect(fieldSpans([])).toEqual([]);
  });

  it('nunca deixa um campo curto isolado no meio de qualquer formulário do portal', () => {
    const forms = [incidente, mudanca, ...REQUEST_CATALOG.flatMap((a) => a.kinds.map((k) => k.form))];
    for (const form of forms) {
      const spans = fieldSpans(form.fields);
      let run = 0;
      spans.forEach((s, i) => {
        if (s === 'half') run += 1;
        else { expect(run % 2, `${form.id} antes de ${form.fields[i].id}`).toBe(0); run = 0; }
      });
    }
  });
});
