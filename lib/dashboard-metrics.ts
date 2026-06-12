import { availability, propertyTypeLabel } from '@/lib/format';
import type { SavedRow } from '@/lib/use-saved-listings-data';

type LiveRow = Extract<SavedRow, { kind: 'live' }>;
function liveRows(rows: SavedRow[]): LiveRow[] {
  return rows.filter((r): r is LiveRow => r.kind === 'live');
}

export interface DashboardKpis {
  savedCount: number;
  availableNow: number;
  avgPrice: number | null;
  priceDrops: number;
}

export function computeKpis(rows: SavedRow[]): DashboardKpis {
  const live = liveRows(rows);
  const availableNow = live.filter(r => availability(r.listing).available).length;
  const prices = live.map(r => r.listing.price).filter((p): p is number => p != null);
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  const priceDrops = live.filter(
    r =>
      r.saved.price_at_save != null &&
      r.listing.price != null &&
      r.listing.price < r.saved.price_at_save,
  ).length;
  return { savedCount: rows.length, availableNow, avgPrice, priceDrops };
}

export interface TypeSlice {
  label: string;
  count: number;
}

export function savedByType(rows: SavedRow[]): TypeSlice[] {
  const counts = new Map<string, number>();
  for (const r of liveRows(rows)) {
    const label = propertyTypeLabel(r.listing.property_type);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export interface PriceBucket {
  label: string;
  count: number;
}

const BUCKETS: { label: string; max: number }[] = [
  { label: '< 500', max: 500 },
  { label: '500–1000', max: 1000 },
  { label: '1000–2000', max: 2000 },
  { label: '2000–3500', max: 3500 },
  { label: '3500+', max: Infinity },
];

export function priceBuckets(rows: SavedRow[]): PriceBucket[] {
  const result = BUCKETS.map(b => ({ label: b.label, count: 0 }));
  for (const r of liveRows(rows)) {
    const p = r.listing.price;
    if (p == null) continue;
    const idx = BUCKETS.findIndex(b => p < b.max);
    result[idx].count += 1;
  }
  return result;
}

export interface ActivityItem {
  id: string;
  title: string;
  href: string | null;
  savedAt: number;
  priceDrop: { from: number; to: number; currency: string } | null;
}

export function buildActivity(rows: SavedRow[]): ActivityItem[] {
  return rows
    .map((r): ActivityItem => {
      const priceDrop =
        r.kind === 'live' &&
        r.saved.price_at_save != null &&
        r.listing.price != null &&
        r.listing.price < r.saved.price_at_save
          ? { from: r.saved.price_at_save, to: r.listing.price, currency: r.saved.currency }
          : null;
      return {
        id: r.saved.listing_id,
        title: r.saved.title,
        href: r.kind === 'live' ? `/listing/${r.listing.id}` : null,
        savedAt: r.saved.saved_at ?? 0,
        priceDrop,
      };
    })
    .sort((a, b) => b.savedAt - a.savedAt);
}
