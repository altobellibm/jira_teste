import { useState, type FormEvent, type ReactNode } from 'react';
import { api } from '../api/client';
import { fieldSpans } from '../forms/layout';
import { CURRENT_USER } from '../forms/lists';
import { buildTicketInput, ticketDetails } from '../forms/ticket';
import type { FormDef, Value, Values } from '../forms/types';
import { validate, type Errors } from '../forms/validate';
import type { Created } from './Confirmation';
import { Field } from './Field';
import { FieldControl } from './FieldControl';

/**
 * Cartão do formulário. `form` pode faltar (Requisição antes de escolher Área e Tipo);
 * nesse caso só o `header` aparece, e ele permanece montado quando o formulário surge.
 */
export function TicketForm({ form, values, onChange, onCreated, header }: {
  form: FormDef | undefined; values: Values; onChange: (id: string, value: Value) => void;
  onCreated: (created: Created) => void; header?: ReactNode;
}) {
  // Os erros pertencem a um formulário: ao trocar de formulário, somem.
  const [shown, setShown] = useState<{ formId: string; errors: Errors }>({ formId: '', errors: {} });
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const errors = form && shown.formId === form.id ? shown.errors : {};
  const spans = fieldSpans(form?.fields ?? []);

  const change = (id: string, value: Value) => {
    onChange(id, value);
    if (errors[id]) setShown({ formId: shown.formId, errors: { ...errors, [id]: '' } });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const found = validate(form, values);
    setShown({ formId: form.id, errors: found });
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`f-${first}`)?.focus(); return; }
    setBusy(true); setFailure('');
    try {
      const ticket = await api.createTicket(buildTicketInput(form, values));
      onCreated({ ticket, details: ticketDetails(form, values) });
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Não foi possível criar o chamado. Tente novamente.');
    } finally { setBusy(false); }
  };

  return (
    <form className="wz-card" onSubmit={submit} noValidate>
      <div className="wz-card__body wz-stack">
        <p className="wz-muted" style={{ fontSize: 14 }}>
          Os campos obrigatórios estão marcados com <span className="wz-req">*</span>.
        </p>
        <div className="wz-formgrid">
          {header}
          {form && form.fields.map((f, i) => (
            <Field
              key={f.id} label={f.label} required={f.required} error={errors[f.id]} htmlFor={`f-${f.id}`}
              wide={spans[i] === 'full'}
              aside={f.assignToMe && (
                <button type="button" className="wz-link wz-linkbtn" style={{ fontSize: 13 }}
                  onClick={() => change(f.id, CURRENT_USER.id)}>Atribuir a mim</button>
              )}
            >
              <FieldControl field={f} value={values[f.id]} onChange={(v) => change(f.id, v)} invalid={!!errors[f.id]} />
            </Field>
          ))}
        </div>
        {form && (
          <>
            {failure && <span className="wz-error" role="alert">{failure}</span>}
            <div className="wz-row">
              <button className="wz-btn wz-btn--primary" disabled={busy}>{busy ? 'Criando…' : 'Criar'}</button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
