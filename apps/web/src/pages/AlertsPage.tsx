import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import type { AlertDto } from '@smart-campus/shared-types';

export function AlertsPage() {
  const { api } = useAuth();
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .alerts()
      .then((res) => setAlerts(res.data))
      .catch((err: Error) => setError(err.message));
  }, [api]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-campus-line bg-white/85 p-5 shadow-panel">
        <h2 className="font-display text-2xl">Alertas</h2>
        <p className="mt-1 text-sm text-campus-deep/75">Alertas fictícios estão claramente marcados como demonstração.</p>
      </section>
      {error ? <p className="text-red-700">{error}</p> : null}
      <div className="space-y-3">
            {alerts.map((a) => (
          <article key={a.id} className="rounded-2xl border border-campus-line bg-white p-4 shadow-panel">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">{a.title}</h3>
              <span className="text-xs">{a.severity}</span>
            </div>
            <p className="mt-1 text-sm text-campus-deep/75">{a.message}</p>
            {a.isDemo ? <p className="mt-2 text-xs text-campus-accent">Dados de demonstração</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
