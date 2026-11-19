export interface Edit { value: string; selectionStart: number; selectionEnd: number }

/** Envolve a seleção com `before`/`after` e mantém o texto original selecionado. */
export function wrapSelection(value: string, start: number, end: number, before: string, after = before): Edit {
  return {
    value: value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: end + before.length,
  };
}

export const FORMATS = {
  bold: { before: '**', after: '**' },
  italic: { before: '_', after: '_' },
  list: { before: '\n- ', after: '' },
  code: { before: '`', after: '`' },
  codeBlock: { before: '\n```\n', after: '\n```\n' },
  link: { before: '[', after: '](https://)' },
} as const;
