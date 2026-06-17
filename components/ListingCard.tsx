import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { propertyTypeLabel, formatPrice } from '@/lib/format';
import { SaveButton } from '@/components/SaveButton';
import { AvailabilityBadge } from '@/components/AvailabilityBadge';
import type { PublicListing } from '@/lib/types';

interface ListingCardProps {
  listing: PublicListing;
  /** Renders as a selectable button (dashboard). Mutually exclusive with href. */
  onSelect?: (listing: PublicListing) => void;
  selected?: boolean;
  /** Renders as a navigation link (homepage / standalone). */
  href?: string;
  /** 'grid' = full photo card (default); 'list' = compact horizontal row. */
  layout?: 'grid' | 'list';
}

export function ListingCard({ listing, onSelect, selected, href, layout = 'grid' }: ListingCardProps) {
  const photo = listing.photos[0];

  // ── Compact list row: small picture · description · price ──────────────────
  if (layout === 'list') {
    const rowInner = (
      <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:h-28 sm:w-44">
          {photo ? (
            <Image
              src={photo}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 128px, 176px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-400">No photo</div>
          )}
          <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-sm">
            {propertyTypeLabel(listing.property_type)}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="truncate text-sm font-semibold text-slate-900">{listing.title}</h3>
          {listing.address_public && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
              <span className="truncate">{listing.address_public}</span>
            </p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-0.5"><Bed className="h-3.5 w-3.5" /> {listing.bedrooms}</span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-0.5"><Bath className="h-3.5 w-3.5" /> {listing.bathrooms}</span>
            )}
            {listing.size_sqm != null && (
              <span className="flex items-center gap-0.5"><Maximize2 className="h-3.5 w-3.5" /> {listing.size_sqm} m²</span>
            )}
          </div>
        </div>
      </div>
    );

    const rowClickable = href ? (
      <Link href={href} className="flex min-w-0 flex-1 focus:outline-none">{rowInner}</Link>
    ) : (
      <button
        type="button"
        onClick={() => onSelect?.(listing)}
        className="flex min-w-0 flex-1 text-left focus:outline-none"
        aria-pressed={selected}
      >
        {rowInner}
      </button>
    );

    return (
      <div
        className={`relative flex items-stretch gap-3 rounded-2xl bg-white p-3 shadow-sm ring-2 transition-all ${
          selected ? 'ring-blue-600' : 'ring-transparent hover:shadow-md'
        }`}
      >
        {rowClickable}
        {/* Save + availability + price — siblings so the interactive controls
            aren't nested inside the navigation link. */}
        <div className="flex shrink-0 flex-col items-end justify-between gap-2 pl-1">
          <div className="flex items-center gap-2">
            <AvailabilityBadge listing={listing} />
            <SaveButton listing={listing} className="h-8 w-8 shadow-sm" />
          </div>
          <p className="whitespace-nowrap text-sm font-bold text-blue-600">
            {formatPrice(listing.price, listing.currency)}
            <span className="text-xs font-normal text-slate-400">/month</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Grid card: full photo ──────────────────────────────────────────────────
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

      {/* Floating info card */}
      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 p-3 shadow-md backdrop-blur">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{listing.title}</h3>
          {listing.address_public && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0 text-blue-600" />
              <span className="truncate">{listing.address_public}</span>
            </p>
          )}
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

  const clickable = href ? (
    <Link href={href} className="block focus:outline-none">
      {card}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => onSelect?.(listing)}
      className="block w-full text-left focus:outline-none"
      aria-pressed={selected}
    >
      {card}
    </button>
  );

  return (
    <div className="relative">
      {clickable}
      {/* Save control overlays the card as a sibling so it isn't a button-in-anchor */}
      <div className="absolute right-3 top-3 z-10">
        <SaveButton listing={listing} className="h-8 w-8 shadow-sm" />
      </div>
      {/* Availability badge overlay — sibling so its popover escapes overflow-hidden */}
      <div className="absolute right-3 top-[3.25rem] z-10">
        <AvailabilityBadge listing={listing} />
      </div>
    </div>
  );
}
