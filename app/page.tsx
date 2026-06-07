import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ListingGrid } from '@/components/ListingGrid';
import { getPublishedListings } from '@/lib/firestore';

export const revalidate = 300;

export default async function HomePage() {
  const allListings = await getPublishedListings();
  const featured = allListings.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-slate-50 py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <Building2 className="h-4 w-4" />
            Properties published by verified owners
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find your next property
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Browse apartments, houses, villas, offices, and vacation rentals —
            listed directly by property owners.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/listings">
                Browse all listings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://rent-agenda.vercel.app" target="_blank" rel="noopener noreferrer">
                List your property
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Latest listings</h2>
          {allListings.length > 6 && (
            <Link
              href="/listings"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              View all {allListings.length} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
        <ListingGrid listings={featured} />
      </section>
    </>
  );
}
