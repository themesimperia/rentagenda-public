'use client';

import { useState, useEffect } from 'react';
import { SearchFilters } from '@/components/SearchFilters';
import { ListingGrid } from '@/components/ListingGrid';
import { getPublishedListings } from '@/lib/firestore';
import type { PublicListing } from '@/lib/types';

export default function ListingsPage() {
  const [allListings, setAllListings] = useState<PublicListing[]>([]);
  const [filtered, setFiltered] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedListings().then(listings => {
      setAllListings(listings);
      setFiltered(listings);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Browse listings</h1>
        {!loading && (
          <p className="mt-1 text-slate-500">
            {filtered.length} of {allListings.length} listings
          </p>
        )}
      </div>

      <div className="mb-8">
        <SearchFilters listings={allListings} onFilter={setFiltered} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <ListingGrid listings={filtered} />
      )}
    </div>
  );
}
