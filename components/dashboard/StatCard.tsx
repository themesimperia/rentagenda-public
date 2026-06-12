import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'blue' | 'emerald';
}

export function StatCard({ icon: Icon, label, value, tone = 'blue' }: StatCardProps) {
  const toneClasses =
    tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${toneClasses}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
