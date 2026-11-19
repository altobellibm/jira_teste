import type { FieldDef, FieldKind } from './types';

export type Span = 'half' | 'full';

/** Textos longos e o Resumo ocupam a linha inteira; seleções, datas e textos curtos dividem a linha em duas colunas. */
const FULL_KINDS: FieldKind[] = ['textarea', 'richtext', 'code'];

export const isFullWidth = (field: Pick<FieldDef, 'id' | 'kind'>): boolean =>
  FULL_KINDS.includes(field.kind) || field.id === 'summary';

/**
 * Largura de cada campo na grade de duas colunas, na ordem do formulário (a ordem nunca muda).
 * Um campo curto que ficaria sozinho no meio da página, porque o próximo é largo, também ocupa a linha inteira,
 * para não deixar um buraco ao lado. Só o último campo pode ficar sozinho em meia linha.
 */
export function fieldSpans(fields: Pick<FieldDef, 'id' | 'kind'>[]): Span[] {
  const spans: Span[] = fields.map((f) => (isFullWidth(f) ? 'full' : 'half'));
  let run = 0; // campos curtos seguidos, ainda sem fechar a linha
  spans.forEach((span, i) => {
    if (span === 'half') { run += 1; return; }
    if (run % 2 === 1) spans[i - 1] = 'full'; // sobrou um curto antes do campo largo
    run = 0;
  });
  return spans;
}
