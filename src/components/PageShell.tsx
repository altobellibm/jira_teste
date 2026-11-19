import { useEffect, type ReactNode } from 'react';
import logo from '../assets/wiise-logo-negativo.png';
import { isMock } from '../api/client';

/** Moldura de cada página: logo, título e conteúdo. Sem barra de navegação (os links vêm do Confluence). */
export function PageShell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => { document.title = `${title} · Wiise`; }, [title]);
  return (
    <main className="wz-page">
      <header className="wz-brand">
        <span className="wz-brand__mark"><img src={logo} alt="Wiise" /></span>
        {isMock && <span className="wz-badge wz-badge--neutral">Demonstração</span>}
      </header>
      <h1 className="wz-title-lg" style={{ marginBottom: 'var(--space-5)' }}>{title}</h1>
      {children}
    </main>
  );
}
