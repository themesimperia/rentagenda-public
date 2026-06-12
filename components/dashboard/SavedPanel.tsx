'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { useSavedListingsData } from '@/lib/use-saved-listings-data';
import { ListingCard } from '@/components/ListingCard';
import { formatPrice } from '@/lib/format';

export function SavedPanel() {
  const { rows: visible, loading } = useSavedListingsData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <SearchX className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-700">No saved listings yet</p>
        <Link href="/listings" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
          Browse properties
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map(row =>
        row.kind === 'live' ? (
          <div key={row.saved.listing_id} className="space-y-1">
            <ListingCard listing={row.listing} href={`/listing/${row.listing.id}`} />
            {row.saved.price_at_save != null &&
              row.listing.price != null &&
              row.listing.price < row.saved.price_at_save && (
                <p className="px-1 text-xs font-medium text-emerald-600">
                  Price dropped from {formatPrice(row.saved.price_at_save, row.saved.currency)}
                </p>
              )}
          </div>
        ) : (
          <div
            key={row.saved.listing_id}
            className="flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-slate-100 p-4"
          >
            <p className="truncate text-sm font-semibold text-slate-700">{row.saved.title}</p>
            <p className="text-xs text-slate-400">No longer available</p>
          </div>
        ),
      )}
    </div>
  );
}
