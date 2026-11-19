import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Option } from '../forms/types';

/** Select acessível (padrão combobox/listbox). */
export function Select({ id, value, options, onChange, placeholder = 'Selecione…', invalid, disabled, required }: {
  id?: string; value: string; options: Option[]; onChange: (id: string) => void;
  placeholder?: string; invalid?: boolean; disabled?: boolean; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (i: number) => { if (options[i]) onChange(options[i].id); setOpen(false); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) choose(active); else setOpen(true); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="wz-selectbox" ref={root}>
      <button
        id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined} aria-invalid={invalid} aria-required={required}
        disabled={disabled}
        className={`wz-select wz-select--btn${invalid ? ' wz-input--invalid' : ''}`}
        onClick={() => { setActive(Math.max(0, options.findIndex((o) => o.id === value))); setOpen(!open); }}
        onKeyDown={onKey}
      >
        {selected ? <span>{selected.label}</span> : <span className="wz-muted">{placeholder}</span>}
      </button>
      {open && (
        <div className="wz-menu wz-selectbox__menu" role="listbox" id={listId}>
          {options.map((o, i) => (
            <div key={o.id} id={`${listId}-${i}`} role="option" aria-selected={o.id === value}
              className={`wz-menu__item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); choose(i); }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
