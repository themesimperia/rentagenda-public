import Link from 'next/link';
import { ListingCard } from '@/components/ListingCard';
import type { PublicListing } from '@/lib/types';

export function TrendingApartments({ listings }: { listings: PublicListing[] }) {
  const apartments = listings
    .filter(l => l.property_type === 'apartment')
    .sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0))
    .slice(0, 4);

  if (apartments.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Trending apartments</h2>
        <p className="mt-2 text-center text-slate-500">
          Most popular choices for renters in Moldova.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {apartments.map(l => (
            <ListingCard key={l.id} listing={l} href={`/listing/${l.id}`} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/listings?type=apartment"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            See all apartments →
          </Link>
        </div>
      </div>
    </section>
  );
}
