import { useEffect, useRef } from 'react';
import { isMock } from '../api/client';
import type { CreatedTicket } from '../api/types';
import type { Detail } from '../forms/ticket';
import { Notice } from './Notice';

export interface Created { ticket: CreatedTicket; details: Detail[] }

export function Confirmation({ created, onAnother }: { created: Created; onAnother: () => void }) {
  const { ticket, details } = created;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); window.scrollTo({ top: 0 }); }, []);

  return (
    <section className="wz-card" aria-labelledby="confirm-title">
      <div className="wz-card__body wz-stack">
        <Notice tone="ok">
          Chamado criado.{' '}
          {isMock ? 'Ambiente de demonstração: nada foi enviado ao Jira.' : 'Você receberá atualizações por e-mail.'}
        </Notice>
        <div>
          <span className="wz-key">{ticket.key}</span>
          <h2 id="confirm-title" ref={heading} tabIndex={-1} className="wz-title-md">{ticket.input.summary}</h2>
        </div>
        <dl className="wz-dl wz-dl--cols">
          {details.map((d, i) => (
            <div key={`${i}-${d.label}`}>
              <dt>{d.label}</dt>
              <dd>{d.code ? <pre className="wz-code">{d.value}</pre> : d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="wz-row">
          <button type="button" className="wz-btn wz-btn--primary" onClick={onAnother}>Criar outro</button>
          {ticket.url && <a className="wz-btn wz-btn--secondary" href={ticket.url} target="_blank" rel="noreferrer">Ver no Jira</a>}
        </div>
      </div>
    </section>
  );
}
