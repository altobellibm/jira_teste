import type { ReactNode } from 'react';

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const cls = tone === 'warn' ? ' wz-notice--warn' : tone === 'ok' ? ' wz-notice--ok' : '';
  return (
    <div className={`wz-notice${cls}`} role={tone === 'ok' ? 'status' : undefined}>
      <span className="wz-notice__mark" /><span style={{ fontSize: 13 }}>{children}</span>
    </div>
  );
}
