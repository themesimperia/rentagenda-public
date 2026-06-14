import Link from 'next/link';
import { Building2, Home, Hotel, Briefcase, Plane } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { propertyTypeLabel } from '@/lib/format';
import type { PublicListing, PropertyType } from '@/lib/types';

const TYPES: { value: PropertyType; icon: LucideIcon }[] = [
  { value: 'apartment', icon: Building2 },
  { value: 'house', icon: Home },
  { value: 'villa', icon: Hotel },
  { value: 'office', icon: Briefcase },
  { value: 'vacation', icon: Plane },
];

export function BrowseByType({ listings }: { listings: PublicListing[] }) {
  const counts = new Map<string, number>();
  for (const l of listings) {
    counts.set(l.property_type, (counts.get(l.property_type) ?? 0) + 1);
  }

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Browse by property type</h2>
        <p className="mt-2 text-center text-slate-500">Jump straight to the kind of home you want.</p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {TYPES.map(t => {
            const Icon = t.icon;
            const n = counts.get(t.value) ?? 0;
            return (
              <Link
                key={t.value}
                href={`/listings?type=${t.value}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-semibold text-slate-800">{propertyTypeLabel(t.value)}</span>
                <span className="text-xs text-slate-400">
                  {n} {n === 1 ? 'property' : 'properties'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
