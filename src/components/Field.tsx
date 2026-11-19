import type { ReactNode } from 'react';

export function Field({ label, required, error, help, aside, htmlFor, wide, children }: {
  label: string; required?: boolean; error?: string; help?: string;
  /** Ocupa a linha inteira da grade do formulário (textos longos). */
  wide?: boolean;
  /** Atalho ao lado do rótulo (ex.: "Atribuir a mim"). */
  aside?: ReactNode; htmlFor?: string; children: ReactNode;
}) {
  const labelEl = (
    <label htmlFor={htmlFor}>{label}{required && <span className="wz-req" aria-hidden="true">*</span>}</label>
  );
  return (
    <div className={wide ? 'wz-field wz-field--full' : 'wz-field'}>
      {aside ? <div className="wz-field__head">{labelEl}{aside}</div> : labelEl}
      {children}
      {help && !error && <span className="wz-help">{help}</span>}
      {error && <span className="wz-error" role="alert">{error}</span>}
    </div>
  );
}
