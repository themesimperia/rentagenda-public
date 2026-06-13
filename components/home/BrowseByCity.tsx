import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { PublicListing } from '@/lib/types';

/** Tally listings by their public location label (what the app filters on). */
function locationCounts(listings: PublicListing[]): { location: string; count: number }[] {
  const map = new Map<string, number>();
  for (const l of listings) {
    const loc = l.address_public?.trim();
    if (loc) map.set(loc, (map.get(loc) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
}

export function BrowseByCity({ listings }: { listings: PublicListing[] }) {
  const locations = locationCounts(listings).slice(0, 8);
  if (locations.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Browse by location</h2>
        <p className="mt-2 text-center text-slate-500">Find homes in your preferred area.</p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map(c => (
            <Link
              key={c.location}
              href={`/listings?region=${encodeURIComponent(c.location)}`}
              className="group flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <span className="flex min-w-0 items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate text-sm font-medium text-slate-800">{c.location}</span>
              </span>
              <span className="shrink-0 text-xs text-slate-400">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
