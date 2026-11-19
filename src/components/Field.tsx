import type { ReactNode } from 'react';

export function Field({ label, required, error, help, aside, htmlFor, children }: {
  label: string; required?: boolean; error?: string; help?: string;
  /** Atalho ao lado do rótulo (ex.: "Atribuir a mim"). */
  aside?: ReactNode; htmlFor?: string; children: ReactNode;
}) {
  const labelEl = (
    <label htmlFor={htmlFor}>{label}{required && <span className="wz-req" aria-hidden="true">*</span>}</label>
  );
  return (
    <div className="wz-field">
      {aside ? <div className="wz-field__head">{labelEl}{aside}</div> : labelEl}
      {children}
      {help && !error && <span className="wz-help">{help}</span>}
      {error && <span className="wz-error" role="alert">{error}</span>}
    </div>
  );
}
