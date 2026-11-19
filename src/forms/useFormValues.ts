import { useState } from 'react';
import { asString, defaultValues } from './ticket';
import type { FormDef, Value, Values } from './types';

/**
 * Valores de um formulário. Ao trocar de formulário (ex.: outra área na Requisição),
 * tudo volta ao padrão, exceto o Resumo, que a pessoa já pode ter digitado.
 */
export function useFormValues(form: FormDef | undefined) {
  const [state, setState] = useState<{ formId: string; values: Values }>({ formId: '', values: {} });

  // Ajuste de estado durante a renderização: o React descarta este passe e renderiza de novo já com os valores novos.
  if (form && state.formId !== form.id) {
    setState({ formId: form.id, values: { ...defaultValues(form), summary: asString(state.values.summary) } });
  }

  return {
    values: state.values,
    setField: (id: string, value: Value) => setState((s) => ({ ...s, values: { ...s.values, [id]: value } })),
    reset: () => { if (form) setState({ formId: form.id, values: defaultValues(form) }); },
  };
}
