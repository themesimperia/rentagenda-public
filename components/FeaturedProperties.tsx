'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Bed, Bath, Maximize2, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { propertyTypeLabel, formatPrice, maskName } from '@/lib/format';
import { deriveTypes } from '@/lib/filter';
import { AvailabilityBadge } from '@/components/AvailabilityBadge';
import type { PublicListing, PropertyType } from '@/lib/types';

const TAB_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartments',
  house: 'Houses',
  villa: 'Villas',
  office: 'Offices',
  vacation: 'Vacation',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function OwnerFooter({ listing }: { listing: PublicListing }) {
  const rawName = listing.owner_name?.trim();
  const display = rawName ? maskName(rawName) : 'Property owner';
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        {listing.owner_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.owner_avatar}
            alt={display}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
            {initials(rawName || 'Property owner')}
          </span>
        )}
        <span className="text-sm font-medium text-slate-600">{display}</span>
      </div>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
        <Eye className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

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
    <div className="relative w-[280px] shrink-0 snap-start sm:w-auto sm:shrink">
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
            sizes="(max-width: 640px) 280px, 25vw"
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

        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
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

      <OwnerFooter listing={listing} />
    </Link>
      {/* Availability badge overlay — sibling outside Link so popover escapes overflow-hidden */}
      <div className="absolute right-3 top-3 z-10">
        <AvailabilityBadge listing={listing} />
      </div>
    </div>
  );
}

export function FeaturedProperties({ listings }: { listings: PublicListing[] }) {
  const types = useMemo(() => deriveTypes(listings), [listings]);
  // `null` = the "All" tab (default), so newly published listings always show.
  const [active, setActive] = useState<PropertyType | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const shown = useMemo(
    () => listings.filter(l => (active ? l.property_type === active : true)).slice(0, 8),
    [listings, active],
  );

  function scroll(dir: -1 | 1) {
    scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.9, behavior: 'smooth' });
  }

  if (listings.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Featured Listings</h2>
        <p className="mt-2 text-center text-slate-500">
          Browse the latest properties from verified owners.
        </p>

        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActive(null)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                active === null ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {types.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                  active === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {TAB_LABELS[t] ?? propertyTypeLabel(t)}
              </button>
            ))}
          </div>
          {shown.length > 1 && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Scroll left"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-600 hover:text-blue-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Scroll right"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-600 hover:text-blue-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scroller}
          className="mt-8 flex snap-x gap-6 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {shown.map(listing => (
            <FeaturedCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Browse all {listings.length} {listings.length === 1 ? 'property' : 'properties'} →
          </Link>
        </div>
      </div>
    </section>
  );
}
