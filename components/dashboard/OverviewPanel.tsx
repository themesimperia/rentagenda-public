'use client';

import Link from 'next/link';
import { Bookmark, CheckCircle2, Wallet, TrendingDown, SearchX } from 'lucide-react';
import { useSavedListingsData, type SavedRow } from '@/lib/use-saved-listings-data';
import { computeKpis, savedByType, priceBuckets, buildActivity } from '@/lib/dashboard-metrics';
import { formatPrice } from '@/lib/format';
import { StatCard } from '@/components/dashboard/StatCard';
import { SavedByTypeChart } from '@/components/dashboard/SavedByTypeChart';
import { PriceBucketsChart } from '@/components/dashboard/PriceBucketsChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ListingCard } from '@/components/ListingCard';

type LiveRow = Extract<SavedRow, { kind: 'live' }>;

export function OverviewPanel() {
  const { rows, loading } = useSavedListingsData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <SearchX className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-700">Start saving homes to see your insights</p>
        <Link href="/listings" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
          Browse properties
        </Link>
      </div>
    );
  }

  const kpis = computeKpis(rows);
  const slices = savedByType(rows);
  const buckets = priceBuckets(rows);
  const activity = buildActivity(rows).slice(0, 8);
  const live = rows.filter((r): r is LiveRow => r.kind === 'live');
  const currency = live[0]?.listing.currency ?? 'USD';
  const recent = live.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Bookmark} label="Saved listings" value={kpis.savedCount} />
        <StatCard icon={CheckCircle2} label="Available now" value={kpis.availableNow} tone="emerald" />
        <StatCard
          icon={Wallet}
          label="Avg saved price"
          value={kpis.avgPrice != null ? formatPrice(kpis.avgPrice, currency) : '—'}
        />
        <StatCard icon={TrendingDown} label="Price drops" value={kpis.priceDrops} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SavedByTypeChart slices={slices} />
        <PriceBucketsChart buckets={buckets} />
      </div>

      <ActivityFeed items={activity} />

      {recent.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recently saved</h3>
            <Link href="/dashboard/saved" className="text-sm font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map(r => (
              <ListingCard key={r.listing.id} listing={r.listing} href={`/listing/${r.listing.id}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
