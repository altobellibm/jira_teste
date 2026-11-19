import { Link } from 'react-router';
import { Notice } from '../components/Notice';
import { PageShell } from '../components/PageShell';

/** Placeholder: o formulário de problema ainda não foi definido. */
export default function ProblemPage() {
  return (
    <PageShell title="Reportar um problema">
      <div className="wz-stack">
        <Notice tone="warn">Esta tela ainda será definida.</Notice>
        <p className="wz-muted">
          Se algo parou ou está indisponível, use <Link className="wz-link" to="/incidente">Relatar um Incidente</Link>.
        </p>
      </div>
    </PageShell>
  );
}
