'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize2, ArrowRight } from 'lucide-react';
import { propertyTypeLabel, formatPrice } from '@/lib/format';
import { deriveTypes } from '@/lib/filter';
import type { PublicListing, PropertyType } from '@/lib/types';

const TAB_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartments',
  house: 'Houses',
  villa: 'Villas',
  office: 'Offices',
  vacation: 'Vacation',
};

function TermBadge({ listing }: { listing: PublicListing }) {
  const isLong = listing.rental_term === 'long_term';
  return (
    <span
      className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm ${
        isLong ? 'bg-emerald-500' : 'bg-amber-500'
      }`}
    >
      {isLong ? 'For Rent' : 'Short Stay'}
    </span>
  );
}

function FeaturedCard({ listing }: { listing: PublicListing }) {
  const photo = listing.photos[0];
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-200">
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">No photo</div>
        )}
        <TermBadge listing={listing} />
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold text-slate-900">{listing.title}</h3>
        {listing.address_public && (
          <p className="mt-1 flex items-center gap-1 truncate text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="truncate">{listing.address_public}</span>
          </p>
        )}
        <p className="mt-2 text-lg font-bold text-blue-600">
          {formatPrice(listing.price, listing.currency)}
          {listing.rental_term === 'long_term' && (
            <span className="text-sm font-normal text-slate-400"> /month</span>
          )}
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" /> {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {listing.bathrooms}
            </span>
          )}
          {listing.size_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-4 w-4" /> {listing.size_sqm} m²
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProperties({ listings }: { listings: PublicListing[] }) {
  const types = useMemo(() => deriveTypes(listings), [listings]);
  const [active, setActive] = useState<PropertyType | null>(types[0] ?? null);

  const shown = useMemo(
    () => listings.filter(l => (active ? l.property_type === active : true)).slice(0, 8),
    [listings, active],
  );

  if (listings.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">Featured Properties</h2>

        {types.length > 1 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            {types.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                  active === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {TAB_LABELS[t] ?? propertyTypeLabel(t)}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map(listing => (
            <FeaturedCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={active ? `/listings?type=${active}` : '/listings'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            View all properties <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
