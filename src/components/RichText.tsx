import { useRef } from 'react';
import { FORMATS, wrapSelection } from '../forms/editor';

const TOOLS = [
  { key: 'bold', label: 'Negrito', content: <b>B</b> },
  { key: 'italic', label: 'Itálico', content: <i>I</i> },
  { key: 'list', label: 'Lista', content: '≡' },
  { key: 'code', label: 'Código em linha', content: '</>' },
  { key: 'codeBlock', label: 'Bloco de código', content: '{ }' },
  { key: 'link', label: 'Link', content: 'Link' },
] as const;

/** Editor simples: um textarea com atalhos que inserem marcação leve (markdown). */
export function RichText({ id, value, onChange, placeholder, invalid, required }: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean; required?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const apply = (key: keyof typeof FORMATS) => {
    const el = ref.current; if (!el) return;
    const { before, after } = FORMATS[key];
    const edit = wrapSelection(value, el.selectionStart, el.selectionEnd, before, after);
    onChange(edit.value);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(edit.selectionStart, edit.selectionEnd); });
  };

  return (
    <div className="wz-textarea" style={invalid ? { borderColor: 'var(--wiise-red-strong)' } : undefined}>
      <div className="wz-textarea__tools" role="toolbar" aria-label="Formatação">
        {TOOLS.map((t) => (
          <button key={t.key} type="button" className={t.key === 'link' ? 'wz-tool--text' : undefined}
            aria-label={t.label} title={t.label} onClick={() => apply(t.key)}>{t.content}</button>
        ))}
      </div>
      <textarea id={id} ref={ref} value={value} placeholder={placeholder} aria-invalid={invalid} aria-required={required}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
