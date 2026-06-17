import { ShieldCheck, BadgeDollarSign, MessageSquare, Building2 } from 'lucide-react';
import { HeroSearch } from '@/components/HeroSearch';
import { FeaturedProperties } from '@/components/FeaturedProperties';
import { HowItWorks } from '@/components/home/HowItWorks';
import { BrowseByCity } from '@/components/home/BrowseByCity';
import { BrowseByType } from '@/components/home/BrowseByType';
import { TrendingApartments } from '@/components/home/TrendingApartments';
import { ValueProps } from '@/components/home/ValueProps';
import { getPublishedListings } from '@/lib/firestore';
import { deriveLocations } from '@/lib/filter';

// Always render fresh so newly published / delisted listings reflect
// immediately rather than waiting on an ISR cache window.
export const dynamic = 'force-dynamic';

// Background photo (CSS background — no next/image remote config needed).
const HERO_BG =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80';

export default async function HomePage() {
  const listings = await getPublishedListings();
  const regions = deriveLocations(listings);

  const stats = [
    { icon: Building2, value: `${listings.length}`, label: 'Live listings' },
    { icon: ShieldCheck, value: '100%', label: 'Verified owners' },
    { icon: BadgeDollarSign, value: '$0', label: 'Agent fees' },
    { icon: MessageSquare, value: 'Direct', label: 'Owner contact' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <div
          className="absolute inset-0 -z-10 bg-slate-800 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 -z-10 bg-slate-900/60" />

        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find Your Next Home
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-200">
            Where every real estate goal becomes reality — listings direct from verified owners.
          </p>

          <div className="mt-7">
            <HeroSearch regions={regions} />
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1. How does RentAgenda work? */}
      <HowItWorks />

      {/* 2. Featured Listings */}
      <FeaturedProperties listings={listings} />

      {/* 3. Browse by property type */}
      <BrowseByType listings={listings} />

      {/* 4. Browse by location */}
      <BrowseByCity listings={listings} />

      {/* 5. Trending apartments */}
      <TrendingApartments listings={listings} />

      {/* 6. Why RentAgenda */}
      <ValueProps />
    </>
  );
}
