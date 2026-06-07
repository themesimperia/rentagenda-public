import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bookmark, Bed, Bath, Maximize2 } from 'lucide-react';
import { propertyTypeLabel, formatPrice, availability } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

interface ListingCardProps {
  listing: PublicListing;
  /** Renders as a selectable button (dashboard). Mutually exclusive with href. */
  onSelect?: (listing: PublicListing) => void;
  selected?: boolean;
  /** Renders as a navigation link (homepage / standalone). */
  href?: string;
}

export function ListingCard({ listing, onSelect, selected, href }: ListingCardProps) {
  const photo = listing.photos[0];
  const avail = availability(listing);

  const card = (
    <div
      className={`group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-sm ring-2 transition-all ${
        selected ? 'ring-blue-600' : 'ring-transparent hover:shadow-md'
      }`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">No photo</div>
      )}

      {/* Category badge */}
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
        {propertyTypeLabel(listing.property_type)}
      </span>

      {/* Availability badge */}
      <span
        className={`absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
          avail.tone === 'green' ? 'text-emerald-600' : 'text-amber-600'
        }`}
      >
        {avail.label}
      </span>

      {/* Floating info card */}
      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 shadow-md backdrop-blur">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{listing.title}</h3>
            {listing.address_public && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
                <span className="truncate">{listing.address_public}</span>
              </p>
            )}
          </div>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Bookmark className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
          <p className="text-sm font-bold text-blue-600">
            {formatPrice(listing.price, listing.currency)}
            <span className="text-xs font-normal text-slate-400">/month</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-0.5">
                <Bed className="h-3.5 w-3.5" /> {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-0.5">
                <Bath className="h-3.5 w-3.5" /> {listing.bathrooms}
              </span>
            )}
            {listing.size_sqm != null && (
              <span className="flex items-center gap-0.5">
                <Maximize2 className="h-3.5 w-3.5" /> {listing.size_sqm}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none">
        {card}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(listing)}
      className="block w-full text-left focus:outline-none"
      aria-pressed={selected}
    >
      {card}
    </button>
  );
}
