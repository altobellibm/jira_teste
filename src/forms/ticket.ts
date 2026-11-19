import type { NewTicketInput } from '../api/types';
import { formatDate, formatDateTime } from './datetime';
import { isFullWidth } from './layout';
import type { FieldDef, FormDef, Value, Values } from './types';

const EMPTY = '—';

export function defaultValues(form: FormDef): Values {
  return Object.fromEntries(form.fields.map((f) => [f.id, f.kind === 'multiselect' ? [] : f.initial ?? '']));
}

export const asString = (v: Value | undefined): string => (Array.isArray(v) ? v.join(', ') : v ?? '');

/** Texto para mostrar ao usuário: rótulo da opção, datas em pt-BR, listas separadas por vírgula. */
export function displayValue(field: FieldDef, value: Value | undefined): string {
  const optionLabel = (id: string) => field.options?.find((o) => o.id === id)?.label ?? id;
  let out: string;
  if (Array.isArray(value)) out = value.map(optionLabel).join(', ');
  else if (field.kind === 'select') out = value ? optionLabel(value) : '';
  else if (field.kind === 'date') out = value ? formatDate(value) : '';
  else if (field.kind === 'datetime') out = value ? formatDateTime(value) : '';
  else out = (value ?? '').trim();
  return out || EMPTY;
}

/** Descrição do ticket. Nos modelos do RH é montada com uma linha "Rótulo: valor" por campo. */
export function composeDescription(form: FormDef, values: Values): string {
  if (!form.descriptionLayout) return asString(values.description).trim();
  return form.descriptionLayout
    .map((part) => {
      if ('text' in part) return part.text;
      const f = form.fields.find((x) => x.id === part.field);
      if (!f) throw new Error(`descriptionLayout aponta para um campo inexistente: ${part.field}`);
      return `${f.label}: ${displayValue(f, values[f.id])}`;
    })
    .join('\n\n');
}

export function buildTicketInput(form: FormDef, values: Values): NewTicketInput {
  return {
    formId: form.id,
    issueType: form.issueType,
    requestType: form.requestType,
    ...(form.serviceCatalog ? { serviceCatalog: form.serviceCatalog } : {}),
    summary: asString(values.summary).trim(),
    description: composeDescription(form, values),
    values,
  };
}

export interface Detail { label: string; value: string; code?: boolean; wide?: boolean }

/** Linhas da confirmação: tipo do ticket e, depois, todos os campos preenchidos (menos o Resumo). */
export function ticketDetails(form: FormDef, values: Values): Detail[] {
  const meta: Detail[] = [
    { label: 'Tipo do ticket', value: form.issueType },
    { label: 'Tipo de solicitação', value: form.requestType ?? 'Nenhum' },
    ...(form.serviceCatalog ? [{ label: 'Suporte: Catálogo de Serviço', value: form.serviceCatalog }] : []),
  ];
  const fields = form.fields
    .filter((f) => f.id !== 'summary')
    .map((f): Detail => ({ label: f.label, value: displayValue(f, values[f.id]), code: f.kind === 'code', wide: isFullWidth(f) }));
  return [...meta, ...fields];
}
