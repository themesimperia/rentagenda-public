interface RingStatProps {
  label: string;
  value: number;
  total: number;
  tone: 'emerald' | 'blue' | 'amber';
}

const TONE: Record<RingStatProps['tone'], string> = {
  emerald: '#10b981',
  blue: '#2563eb',
  amber: '#f59e0b',
};

export function RingStat({ label, value, total, tone }: RingStatProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const fraction = total > 0 ? value / total : 0;
  const dash = fraction * circumference;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="mb-2 text-xs font-medium text-slate-500">{label}</p>
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={TONE[tone]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
        </div>
      </div>
    </div>
  );
}
