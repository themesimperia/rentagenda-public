import type { Metadata } from 'next';
import { MarketplaceDashboard } from '@/components/MarketplaceDashboard';
import { getPublishedListings } from '@/lib/firestore';
import { paramsToFilters } from '@/lib/filter-url';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse properties',
  description:
    'Filter apartments, houses, villas, offices, and vacation rentals published directly by verified owners.',
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) value.forEach(v => usp.append(key, v));
    else if (value != null) usp.set(key, value);
  }
  const initial = paramsToFilters(usp);

  const listings = await getPublishedListings();

  return <MarketplaceDashboard initialListings={listings} initialFilters={initial} />;
}
