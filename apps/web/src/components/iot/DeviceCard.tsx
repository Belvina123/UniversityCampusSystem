import type { DeviceDto, DeviceStatus } from '@smart-campus/shared-types';

const statusStyle: Record<DeviceStatus, string> = {
  ONLINE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  OFFLINE: 'bg-slate-100 text-slate-600 border-slate-200',
  MAINTENANCE: 'bg-amber-50 text-amber-900 border-amber-200',
  UNKNOWN: 'bg-slate-100 text-slate-500 border-slate-200',
};

export function DeviceCard({ device }: { device: DeviceDto }) {
  return (
    <article className="rounded-2xl border border-campus-line/80 bg-white/90 p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-wide text-campus-teal">{device.code}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-campus-ink">{device.name}</h3>
          <p className="mt-1 text-xs text-campus-deep/65">
            {device.type} · {device.room ? `${device.room.code} ${device.room.name}` : 'Sem sala'}
          </p>
        </div>
        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusStyle[device.status]}`}>
          {device.status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-xs text-campus-deep/70">
        <p>Tópico MQTT: {device.mqttTopic ?? '—'}</p>
        {device.sensors.length === 0 ? (
          <p>Sem sensores associados</p>
        ) : (
          device.sensors.map((s) => (
            <p key={s.id}>
              Sensor: {s.name} ({s.metric}
              {s.unit ? `, ${s.unit}` : ''})
            </p>
          ))
        )}
      </div>
    </article>
  );
}