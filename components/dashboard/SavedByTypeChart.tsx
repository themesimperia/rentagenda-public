import type { TypeSlice } from '@/lib/dashboard-metrics';

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

export function SavedByTypeChart({ slices }: { slices: TypeSlice[] }) {
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Saved by property type</h3>
      <div className="flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="20" />
            {slices.map((s, i) => {
              const len = total ? (s.count / total) * circumference : 0;
              const dash = `${len} ${circumference - len}`;
              const node = (
                <circle
                  key={s.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth="20"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return node;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-400">saved</p>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {slices.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-slate-700">{s.label}</span>
              <span className="font-semibold text-slate-900">{s.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
