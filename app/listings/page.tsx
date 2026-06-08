import type { Metadata } from 'next';
import { MarketplaceDashboard } from '@/components/MarketplaceDashboard';
import type { MarketplaceFilters } from '@/lib/filter';
import type { PropertyType, RentalTerm } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Browse properties',
  description:
    'Filter apartments, houses, villas, offices, and vacation rentals published directly by verified owners.',
};

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'villa', 'office', 'vacation'];
const RENTAL_TERMS: RentalTerm[] = ['long_term', 'short_term'];

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial: Partial<MarketplaceFilters> = {};

  const q = one(sp.q);
  if (q) initial.search = q;

  const type = one(sp.type);
  if (type && PROPERTY_TYPES.includes(type as PropertyType)) {
    initial.types = [type as PropertyType];
  }

  const term = one(sp.term);
  if (term && RENTAL_TERMS.includes(term as RentalTerm)) {
    initial.terms = [term as RentalTerm];
  }

  const region = one(sp.region);
  if (region) initial.locations = [region];

  const priceMin = one(sp.priceMin);
  if (priceMin && !Number.isNaN(Number(priceMin))) initial.priceMin = Number(priceMin);

  const priceMax = one(sp.priceMax);
  if (priceMax && !Number.isNaN(Number(priceMax))) initial.priceMax = Number(priceMax);

  return <MarketplaceDashboard initialFilters={initial} />;
}
