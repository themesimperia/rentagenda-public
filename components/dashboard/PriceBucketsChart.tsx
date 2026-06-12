import type { PriceBucket } from '@/lib/dashboard-metrics';

export function PriceBucketsChart({ buckets }: { buckets: PriceBucket[] }) {
  const max = Math.max(1, ...buckets.map(b => b.count));
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Saved by price range</h3>
      <ul className="space-y-3">
        {buckets.map(b => (
          <li key={b.label} className="flex items-center gap-3 text-sm">
            <span className="w-20 shrink-0 text-slate-500">{b.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-blue-600"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right font-semibold text-slate-900">{b.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
