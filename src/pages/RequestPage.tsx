import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Confirmation, type Created } from '../components/Confirmation';
import { Field } from '../components/Field';
import { PageShell } from '../components/PageShell';
import { Select } from '../components/Select';
import { TicketForm } from '../components/TicketForm';
import { resolveSelection, type Selection } from '../forms/deeplink';
import { REQUEST_CATALOG } from '../forms/definitions';
import { useFormValues } from '../forms/useFormValues';

/** Requisição: escolhe a Área, depois o Tipo, e o formulário certo aparece. Aceita ?area=&tipo= no link. */
export default function RequestPage() {
  const [params] = useSearchParams();
  const fromUrl = resolveSelection(REQUEST_CATALOG, params.get('area'), params.get('tipo'));
  const [sel, setSel] = useState<Selection>(fromUrl);
  // Se o link mudar com a página aberta (outro cartão do Confluence), a seleção acompanha.
  useEffect(() => { setSel({ areaId: fromUrl.areaId, kindId: fromUrl.kindId }); }, [fromUrl.areaId, fromUrl.kindId]);

  const area = REQUEST_CATALOG.find((a) => a.id === sel.areaId);
  const kind = area?.kinds.find((k) => k.id === sel.kindId);
  const form = kind?.form;
  const { values, setField, reset } = useFormValues(form);
  const [created, setCreated] = useState<Created | null>(null);

  const header = (
    <>
      <Field label="Área" required htmlFor="f-area">
        <Select
          id="f-area" required value={sel.areaId} placeholder="Selecione a área"
          options={REQUEST_CATALOG.map((a) => ({ id: a.id, label: a.label }))}
          onChange={(id) => setSel(resolveSelection(REQUEST_CATALOG, id, null))}
        />
      </Field>
      <Field label="Tipo de solicitação" required htmlFor="f-tipo">
        <Select
          id="f-tipo" required value={sel.kindId} disabled={!area}
          placeholder={area ? 'Selecione o tipo' : 'Selecione a área primeiro'}
          options={(area?.kinds ?? []).map((k) => ({ id: k.id, label: k.label }))}
          onChange={(id) => setSel((s) => ({ ...s, kindId: id }))}
        />
      </Field>
    </>
  );

  return (
    <PageShell title="Fazer uma requisição">
      {created
        ? <Confirmation created={created} onAnother={() => { reset(); setCreated(null); }} />
        : <TicketForm form={form} values={values} onChange={setField} onCreated={setCreated} header={header} />}
    </PageShell>
  );
}
