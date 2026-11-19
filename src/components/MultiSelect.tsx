import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Option } from '../forms/types';

/** Seleção múltipla (combobox/listbox com caixas de marcação). O menu fica aberto enquanto se marca. */
export function MultiSelect({ id, value, options, onChange, placeholder = 'Selecione…', invalid }: {
  id?: string; value: string[]; options: Option[]; onChange: (ids: string[]) => void;
  placeholder?: string; invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const summary = options.filter((o) => value.includes(o.id)).map((o) => o.label).join(', ');

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const toggle = (i: number) => {
    const opt = options[i]; if (!opt) return;
    onChange(value.includes(opt.id) ? value.filter((v) => v !== opt.id) : [...value, opt.id]);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) toggle(active); else setOpen(true); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="wz-selectbox" ref={root}>
      <button
        id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined} aria-invalid={invalid}
        className={`wz-select wz-select--btn${invalid ? ' wz-input--invalid' : ''}`}
        onClick={() => setOpen(!open)} onKeyDown={onKey}
      >
        {summary ? <span>{summary}</span> : <span className="wz-muted">{placeholder}</span>}
      </button>
      {open && (
        <div className="wz-menu wz-selectbox__menu" role="listbox" aria-multiselectable="true" id={listId}>
          {options.map((o, i) => (
            <div key={o.id} id={`${listId}-${i}`} role="option" aria-selected={value.includes(o.id)}
              className={`wz-menu__item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); toggle(i); }}>
              <input type="checkbox" className="wz-check" tabIndex={-1} checked={value.includes(o.id)} readOnly aria-hidden="true" />
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
