import { useState } from 'react';
import { Confirmation, type Created } from '../components/Confirmation';
import { PageShell } from '../components/PageShell';
import { TicketForm } from '../components/TicketForm';
import type { FormDef } from '../forms/types';
import { useFormValues } from '../forms/useFormValues';

/** Página de um formulário simples (Incidente, Mudança): o formulário e, depois de criar, a confirmação. */
export default function FormPage({ form }: { form: FormDef }) {
  const { values, setField, reset } = useFormValues(form);
  const [created, setCreated] = useState<Created | null>(null);

  return (
    <PageShell title={form.title}>
      {created
        ? <Confirmation created={created} onAnother={() => { reset(); setCreated(null); }} />
        : <TicketForm form={form} values={values} onChange={setField} onCreated={setCreated} />}
    </PageShell>
  );
}
