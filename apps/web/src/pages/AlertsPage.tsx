import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import type { AlertDto } from '@smart-campus/shared-types';

export function AlertsPage() {
  const { api, user } = useAuth();
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canManage = !!user && ['ADMIN', 'COORDINATOR', 'TECHNICIAN'].includes(user.role);

  async function load() {
    const res = await api.alerts();
    setAlerts(res.data);
  }

  useEffect(() => {
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  async function onAck(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await api.ackAlert(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar alerta');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-campus-line bg-white/85 p-5 shadow-panel">
        <h2 className="font-display text-2xl">Alertas</h2>
        <p className="mt-1 text-sm text-campus-deep/75">Alertas fictícios estão claramente marcados como demonstração.</p>
      </section>

      {error ? <p className="text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-campus-deep/70">A carregar alertas…</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-campus-deep/70">Nenhum alerta para mostrar.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <article key={a.id} className="rounded-2xl border border-campus-line bg-white p-4 shadow-panel">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">{a.title}</h3>
                <span className="text-xs">{a.severity}</span>
              </div>
              <p className="mt-1 text-sm text-campus-deep/75">{a.message}</p>
              {a.isDemo ? <p className="mt-2 text-xs text-campus-accent">Dados de demonstração</p> : null}
              <div className="mt-3 flex items-center gap-3 text-xs">
                {a.acknowledged ? (
                  <span className="font-semibold text-emerald-700">Confirmado</span>
                ) : canManage ? (
                  <button
                    type="button"
                    disabled={busyId === a.id}
                    onClick={() => onAck(a.id)}
                    className="btn-primary"
                  >
                    {busyId === a.id ? 'A confirmar…' : 'Confirmar alerta'}
                  </button>
                ) : (
                  <span className="text-campus-deep/60">Por confirmar</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}