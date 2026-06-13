'use client';

import Link from 'next/link';
import { useSavedListingsData, type SavedRow } from '@/lib/use-saved-listings-data';
import { ListingCard } from '@/components/ListingCard';

type LiveRow = Extract<SavedRow, { kind: 'live' }>;

export function RecentlySaved() {
  const { rows, loading } = useSavedListingsData();
  const live = rows.filter((r): r is LiveRow => r.kind === 'live').slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recently saved</h3>
        <Link href="/dashboard/saved" className="text-sm font-medium text-blue-600 hover:underline">
          View all →
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : live.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nothing saved yet ·{' '}
          <Link href="/listings" className="font-medium text-blue-600 hover:underline">
            Browse
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {live.map(r => (
            <ListingCard key={r.listing.id} listing={r.listing} href={`/listing/${r.listing.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
