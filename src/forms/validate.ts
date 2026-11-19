import { DATETIME_RE, DATE_RE } from './datetime';
import type { FieldDef, FormDef, Values } from './types';

export type Errors = Record<string, string>;

/** O bloco de código só vale se tiver ao menos uma linha além do cabeçalho pré-preenchido. */
export function codeHasContent(value: string, header = ''): boolean {
  return value.split('\n').map((l) => l.trim()).some((l) => l !== '' && l !== header.trim());
}

function isFilled(f: FieldDef, value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  const v = (value ?? '').trim();
  if (f.kind === 'code') return codeHasContent(v, f.initial);
  if (f.kind === 'date') return DATE_RE.test(v);
  if (f.kind === 'datetime') return DATETIME_RE.test(v);
  return v !== '';
}

const missingMessage = (f: FieldDef): string => {
  const label = f.label.toLowerCase();
  switch (f.kind) {
    case 'select': case 'multiselect': return `Selecione ${label}.`;
    case 'datetime': return `Informe a data e o horário: ${label}.`;
    case 'date': return `Informe a data: ${label}.`;
    case 'code': return `Adicione ao menos uma linha em ${label}.`;
    default: return `Preencha o campo ${label}.`;
  }
};

/** Devolve um erro por campo inválido, na ordem dos campos do formulário. */
export function validate(form: FormDef, values: Values): Errors {
  const errors: Errors = {};
  for (const f of form.fields) {
    const value = values[f.id];
    if (f.required && !isFilled(f, value)) { errors[f.id] = missingMessage(f); continue; }
    if (f.notBefore && typeof value === 'string' && DATETIME_RE.test(value)) {
      const other = values[f.notBefore.field];
      if (typeof other === 'string' && DATETIME_RE.test(other) && value < other) errors[f.id] = f.notBefore.message;
    }
  }
  return errors;
}
